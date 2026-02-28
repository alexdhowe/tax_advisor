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
  const timeStr = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1 group">
        <div className="flex items-center gap-2 px-1">
          {message.authorName && (
            <span className="text-[11px] font-medium text-slate-500">{message.authorName}</span>
          )}
          <span className="text-[10px] text-slate-400">{timeStr}</span>
        </div>
        <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-4 py-3 bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm shadow-indigo-200">
          <p className="text-[13px] text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1.5 group">
      <div className="flex items-center gap-2 px-1">
        {message.agentType && <AgentBadge agentType={message.agentType as AgentType} />}
        <span className="text-[10px] text-slate-400">{timeStr}</span>
      </div>
      <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-sm px-4 py-3">
        <div className="chat-prose">
          <ReactMarkdown>{message.content}</ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-slate-400 animate-pulse rounded-sm ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  )
}
