'use client'

import { AgentBadge } from '@/components/agents/AgentBadge'
import { AgentType } from '@/lib/agents'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentType?: string | null
  authorName?: string | null
  createdAt: string | Date
}

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const date = new Date(message.createdAt)
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        {!isUser && message.agentType && (
          <AgentBadge agentType={message.agentType as AgentType} />
        )}
        {isUser && message.authorName && (
          <span className="text-xs font-medium text-gray-600">{message.authorName}</span>
        )}
        <span className="text-xs text-gray-400">{timeStr}</span>
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-li:text-gray-700 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded prose-table:text-sm prose-th:bg-gray-50 prose-strong:text-gray-900">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
