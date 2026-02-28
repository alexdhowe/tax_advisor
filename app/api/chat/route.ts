import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAgent, AgentType } from '@/lib/agents'
import { buildDocumentContext } from '@/lib/documents'
import { runOrchestrator } from '@/lib/agents/orchestrator'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildMatterContext(matter: {
  title: string
  description: string | null
  client: { name: string; type: string; taxId: string | null; notes: string | null }
}): string {
  return `## CLIENT & MATTER INFORMATION
Client Name: ${matter.client.name}
Client Type: ${matter.client.type}
${matter.client.taxId ? `Tax ID: ${matter.client.taxId}` : ''}
${matter.client.notes ? `Client Notes: ${matter.client.notes}` : ''}

Matter Title: ${matter.title}
${matter.description ? `Matter Description: ${matter.description}` : ''}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { matterId, message, agentType, authorName } = body as {
      matterId: string
      message: string
      agentType: AgentType
      authorName: string
    }

    if (!matterId || !message || !agentType) {
      return NextResponse.json({ error: 'matterId, message, and agentType are required' }, { status: 400 })
    }

    // Fetch matter + client
    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: {
        client: true,
        documents: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    // Fetch last 50 messages for history
    const historyMessages = await prisma.message.findMany({
      where: { matterId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    const conversationHistory = historyMessages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Build context blocks
    const matterContext = buildMatterContext(matter)
    const documentContext = buildDocumentContext(
      matter.documents.map((d: { filename: string; fileType: string; extractedText: string | null }) => ({
        filename: d.filename,
        fileType: d.fileType,
        extractedText: d.extractedText,
      }))
    )

    // Save user message
    await prisma.message.create({
      data: {
        matterId,
        role: 'user',
        content: message,
        agentType,
        authorName: authorName || null,
      },
    })

    // Orchestrator path — custom SSE stream
    if (agentType === 'orchestrator') {
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          let fullResponse = ''
          const specialistDetails: Array<{ specialist: string; name: string; response: string }> = []

          try {
            const gen = runOrchestrator(message, matterContext, documentContext, conversationHistory)

            for await (const event of gen) {
              const data = JSON.stringify(event) + '\n'
              controller.enqueue(encoder.encode(data))

              if (event.type === 'text') {
                fullResponse += event.text as string
              }
              if (event.type === 'specialist_detail') {
                specialistDetails.push({
                  specialist: event.specialist as string,
                  name: event.name as string,
                  response: event.response as string,
                })
              }
            }

            // Build full saved content
            const savedContent = buildSavedOrchestratorContent(fullResponse, specialistDetails)

            // Save assistant message
            await prisma.message.create({
              data: {
                matterId,
                role: 'assistant',
                content: savedContent,
                agentType: 'orchestrator',
              },
            })

            controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'))
          } catch (err) {
            console.error('Orchestrator stream error:', err)
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: 'error', message: 'An error occurred during analysis.' }) + '\n')
            )
          } finally {
            controller.close()
          }
        },
      })

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no',
        },
      })
    }

    // Specialist path — streaming via Anthropic SDK
    const agentConfig = getAgent(agentType)
    const fullSystemPrompt = `${agentConfig.systemPrompt}

${matterContext}

${documentContext}`

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    let fullAssistantResponse = ''

    const anthropicStream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: fullSystemPrompt,
      messages,
    })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of anthropicStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text
              fullAssistantResponse += text
              const data = JSON.stringify({ type: 'text', text }) + '\n'
              controller.enqueue(encoder.encode(data))
            }
          }

          // Save completed response
          await prisma.message.create({
            data: {
              matterId,
              role: 'assistant',
              content: fullAssistantResponse,
              agentType,
            },
          })

          controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'))
        } catch (err) {
          console.error('Specialist stream error:', err)
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: 'error', message: 'An error occurred.' }) + '\n')
          )
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('POST /api/chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildSavedOrchestratorContent(
  synthesis: string,
  specialistDetails: Array<{ specialist: string; name: string; response: string }>
): string {
  if (specialistDetails.length === 0) return synthesis

  const details = specialistDetails
    .map(s => `### ${s.name}\n${s.response}`)
    .join('\n\n---\n\n')

  return `${synthesis}\n\n---\n\n## Specialist Analysis Detail\n\n${details}`
}
