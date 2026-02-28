import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { individualAgentConfig } from './individual'
import { corporateAgentConfig } from './corporate'
import { partnershipAgentConfig } from './partnership'
import { orchestratorAgentConfig, ORCHESTRATOR_AGENT_ID } from './orchestrator-config'
export { orchestratorAgentConfig, ORCHESTRATOR_AGENT_ID }

export const orchestratorTools: Anthropic.Tool[] = [
  {
    name: 'call_individual_expert',
    description: 'Consult Dr. Sarah Chen, the Individual Tax Expert, for questions about individual income tax, capital gains, retirement accounts, estate/gift tax, AMT, QBI, cryptocurrency, and personal tax planning.',
    input_schema: {
      type: 'object' as const,
      properties: {
        question: {
          type: 'string',
          description: 'The specific tax question to ask the individual tax expert. Be precise and include all relevant facts.',
        },
        client_context: {
          type: 'string',
          description: 'Brief context about the client and matter (entity type, relevant facts, filing status, approximate income level).',
        },
      },
      required: ['question', 'client_context'],
    },
  },
  {
    name: 'call_corporate_expert',
    description: 'Consult Michael Torres, the Corporate Tax Expert, for questions about C-corporation taxation, CAMT, GILTI/BEAT/FDII, M&A structuring, NOLs and §382, international tax, R&D under §174, and executive compensation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        question: {
          type: 'string',
          description: 'The specific tax question to ask the corporate tax expert. Be precise and include all relevant facts.',
        },
        client_context: {
          type: 'string',
          description: 'Brief context about the client and matter (entity type, jurisdiction, transaction size, revenue scale).',
        },
      },
      required: ['question', 'client_context'],
    },
  },
  {
    name: 'call_partnership_expert',
    description: 'Consult Jennifer Walsh, the Partnership Tax Expert, for questions about partnerships, LLCs, S-corporations, Subchapter K, §704(b/c) allocations, outside basis, §751 hot assets, §754 elections, and pass-through entity taxes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        question: {
          type: 'string',
          description: 'The specific tax question to ask the partnership tax expert. Be precise and include all relevant facts.',
        },
        client_context: {
          type: 'string',
          description: 'Brief context about the client and matter (entity type, partner structure, relevant IRC sections, state of formation).',
        },
      },
      required: ['question', 'client_context'],
    },
  },
]

interface SpecialistCall {
  specialist: 'individual' | 'corporate' | 'partnership'
  question: string
  clientContext: string
}

interface SpecialistResponse {
  specialist: 'individual' | 'corporate' | 'partnership'
  response: string
}

export async function callSpecialist(
  call: SpecialistCall,
  matterContext: string,
  documentContext: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let agentConfig
  switch (call.specialist) {
    case 'individual':
      agentConfig = individualAgentConfig
      break
    case 'corporate':
      agentConfig = corporateAgentConfig
      break
    case 'partnership':
      agentConfig = partnershipAgentConfig
      break
  }

  const fullSystemPrompt = `${agentConfig.systemPrompt}

## MATTER CONTEXT
${matterContext}

## DOCUMENTS AVAILABLE
${documentContext || 'No documents uploaded for this matter.'}

Note: You are being consulted by the Lead Tax Partner (Orchestrator) as part of a larger multi-area analysis. Focus on your specialty area and be comprehensive. The Orchestrator will synthesize your response with other specialists.`

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user',
      content: `[ORCHESTRATOR REQUEST]\n\nClient Context: ${call.clientContext}\n\nQuestion: ${call.question}`,
    },
  ]

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: fullSystemPrompt,
    messages,
  })

  const textContent = response.content.find(c => c.type === 'text')
  return textContent ? textContent.text : 'No response from specialist.'
}

export async function* runOrchestrator(
  userMessage: string,
  matterContext: string,
  documentContext: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): AsyncGenerator<{ type: string; [key: string]: unknown }> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const fullSystemPrompt = `${orchestratorAgentConfig.systemPrompt}

## MATTER CONTEXT
${matterContext}

## DOCUMENTS AVAILABLE
${documentContext || 'No documents uploaded for this matter.'}`

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.slice(-20).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  yield { type: 'orchestrator_thinking', text: 'Analyzing the tax issue to determine which specialists to consult...' }

  // First call: orchestrator decides which specialists to call
  const orchestratorResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: fullSystemPrompt,
    tools: orchestratorTools,
    tool_choice: { type: 'auto' },
    messages,
  })

  const toolUses = orchestratorResponse.content.filter(c => c.type === 'tool_use')

  if (toolUses.length === 0) {
    // Orchestrator didn't call any tools — yield its text response
    const textBlock = orchestratorResponse.content.find(c => c.type === 'text')
    if (textBlock && textBlock.type === 'text') {
      yield { type: 'text', text: textBlock.text }
    }
    return
  }

  // Call all specialists in parallel
  const specialistCalls: SpecialistCall[] = toolUses
    .filter(t => t.type === 'tool_use')
    .map(t => {
      if (t.type !== 'tool_use') throw new Error('Expected tool_use')
      const input = t.input as { question: string; client_context: string }
      let specialist: 'individual' | 'corporate' | 'partnership'
      if (t.name === 'call_individual_expert') specialist = 'individual'
      else if (t.name === 'call_corporate_expert') specialist = 'corporate'
      else specialist = 'partnership'

      return {
        specialist,
        question: input.question,
        clientContext: input.client_context,
      }
    })

  for (const call of specialistCalls) {
    const specialistName =
      call.specialist === 'individual'
        ? 'Individual Tax Expert (Dr. Sarah Chen)'
        : call.specialist === 'corporate'
        ? 'Corporate Tax Expert (Michael Torres)'
        : 'Partnership Tax Expert (Jennifer Walsh)'

    yield { type: 'specialist_called', specialist: call.specialist, name: specialistName }
  }

  const specialistResponses: SpecialistResponse[] = await Promise.all(
    specialistCalls.map(async call => ({
      specialist: call.specialist,
      response: await callSpecialist(call, matterContext, documentContext, conversationHistory),
    }))
  )

  yield { type: 'orchestrator_thinking', text: 'Synthesizing specialist responses into an integrated analysis...' }

  // Build tool results for follow-up orchestrator call
  const toolResults: Anthropic.ToolResultBlockParam[] = specialistResponses.map((sr, i) => ({
    type: 'tool_result' as const,
    tool_use_id: (toolUses[i] as Anthropic.ToolUseBlock).id,
    content: sr.response,
  }))

  // Second orchestrator call: synthesize
  const synthesisMessages: Anthropic.MessageParam[] = [
    ...messages,
    { role: 'assistant', content: orchestratorResponse.content },
    { role: 'user', content: toolResults },
  ]

  const synthesisResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: `${fullSystemPrompt}

You have now received responses from your specialist(s). Synthesize them into a comprehensive, integrated analysis following your synthesis protocol. Lead with the key conclusion, highlight cross-area interactions, and provide a unified action plan.`,
    messages: synthesisMessages,
  })

  const synthesisText = synthesisResponse.content.find(c => c.type === 'text')
  if (synthesisText && synthesisText.type === 'text') {
    yield { type: 'text', text: synthesisText.text }
  }

  // Append specialist detail as supplementary sections
  for (const sr of specialistResponses) {
    const expertName =
      sr.specialist === 'individual'
        ? 'Individual Tax Expert (Dr. Sarah Chen)'
        : sr.specialist === 'corporate'
        ? 'Corporate Tax Expert (Michael Torres)'
        : 'Partnership Tax Expert (Jennifer Walsh)'

    yield {
      type: 'specialist_detail',
      specialist: sr.specialist,
      name: expertName,
      response: sr.response,
    }
  }
}
