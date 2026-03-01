'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MessageBubble } from './MessageBubble'
import { StreamingIndicator } from './StreamingIndicator'
import { ChatInput } from './ChatInput'
import { AgentType } from '@/lib/agents'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentType?: string | null
  authorName?: string | null
  createdAt: string | Date
}

interface StreamingState {
  isStreaming: boolean
  partialText: string
  agentType: AgentType
  orchestratorStatus?: string
  specialistsCalled: Array<{ specialist: string; name: string }>
}

interface ChatWindowProps {
  matterId: string
  selectedAgent: AgentType
}

const POLL_INTERVAL = 10000

export function ChatWindow({ matterId, selectedAgent }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState<StreamingState>({
    isStreaming: false,
    partialText: '',
    agentType: 'individual',
    specialistsCalled: [],
  })
  const [authorName, setAuthorName] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastFetchRef = useRef<number>(0)
  const isNearBottomRef = useRef(true)

  // Load author name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taxAdvisorAuthorName')
    if (saved) setAuthorName(saved)
  }, [])

  const saveAuthorName = (name: string) => {
    setAuthorName(name)
    localStorage.setItem('taxAdvisorAuthorName', name)
  }

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${matterId}`)
      if (!res.ok) return
      const data: Message[] = await res.json()
      setMessages(data)
      lastFetchRef.current = Date.now()
    } catch {
      // ignore network errors during polling
    }
  }, [matterId])

  // Initial fetch
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Polling for multi-user awareness
  useEffect(() => {
    const interval = setInterval(() => {
      if (!streaming.isStreaming) {
        fetchMessages()
      }
    }, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [streaming.isStreaming, fetchMessages])

  // Track whether user is near the bottom
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100
  }, [])

  // Auto-scroll only when user is already near the bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streaming.partialText])

  const handleSend = async (message: string) => {
    if (streaming.isStreaming) return

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`
    const userMsg: Message = {
      id: tempId,
      role: 'user',
      content: message,
      agentType: selectedAgent,
      authorName,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    setStreaming({
      isStreaming: true,
      partialText: '',
      agentType: selectedAgent,
      orchestratorStatus: selectedAgent === 'orchestrator' ? 'Analyzing the tax issue...' : undefined,
      specialistsCalled: [],
    })

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matterId, message, agentType: selectedAgent, authorName }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)

            if (event.type === 'text') {
              accumulatedText += event.text
              setStreaming(prev => ({ ...prev, partialText: accumulatedText }))
            } else if (event.type === 'orchestrator_thinking') {
              setStreaming(prev => ({ ...prev, orchestratorStatus: event.text as string }))
            } else if (event.type === 'specialist_called') {
              setStreaming(prev => ({
                ...prev,
                specialistsCalled: [...prev.specialistsCalled, { specialist: event.specialist as string, name: event.name as string }],
              }))
            } else if (event.type === 'done') {
              // Fetch final messages from DB to get accurate saved version
              await fetchMessages()
              setStreaming({ isStreaming: false, partialText: '', agentType: selectedAgent, specialistsCalled: [] })
            } else if (event.type === 'error') {
              throw new Error(event.message as string)
            }
          } catch (parseErr) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Chat error:', err)
      setStreaming({ isStreaming: false, partialText: '', agentType: selectedAgent, specialistsCalled: [] })
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 px-5 py-5"
      >
        <div className="flex flex-col gap-5 max-w-3xl mx-auto">
          {messages.length === 0 && !streaming.isStreaming && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-4">
                <span className="text-xl">⚖️</span>
              </div>
              <p className="text-slate-600 font-medium text-sm">Ready to advise</p>
              <p className="text-slate-400 text-xs mt-1">Select an agent on the right and ask your first tax question.</p>
            </div>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {streaming.isStreaming && streaming.partialText && (
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streaming.partialText,
                agentType: streaming.agentType,
                authorName: null,
                createdAt: new Date().toISOString(),
              }}
              isStreaming
            />
          )}
          {streaming.isStreaming && !streaming.partialText && (
            <StreamingIndicator
              agentType={streaming.agentType}
              orchestratorStatus={streaming.orchestratorStatus}
              specialistsCalled={streaming.specialistsCalled}
            />
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <ChatInput
        onSend={handleSend}
        disabled={streaming.isStreaming}
        selectedAgent={selectedAgent}
        authorName={authorName}
        onAuthorNameChange={saveAuthorName}
      />
    </div>
  )
}
