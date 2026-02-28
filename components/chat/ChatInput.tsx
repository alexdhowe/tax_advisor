'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Loader2, User } from 'lucide-react'
import { AgentType } from '@/lib/agents'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  selectedAgent: AgentType
  authorName: string
  onAuthorNameChange: (name: string) => void
}

const agentAccent: Record<AgentType, string> = {
  individual:   'focus-within:border-blue-300 focus-within:ring-blue-100',
  corporate:    'focus-within:border-emerald-300 focus-within:ring-emerald-100',
  partnership:  'focus-within:border-violet-300 focus-within:ring-violet-100',
  orchestrator: 'focus-within:border-amber-300 focus-within:ring-amber-100',
}

const sendBtnColor: Record<AgentType, string> = {
  individual:   'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
  corporate:    'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
  partnership:  'bg-violet-600 hover:bg-violet-700 shadow-violet-200',
  orchestrator: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
}

export function ChatInput({ onSend, disabled, selectedAgent, authorName, onAuthorNameChange }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setMessage('')
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.focus()
      }
    }, 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  return (
    <div className="bg-white border-t border-slate-100 px-4 py-3">
      {/* Author row */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <User className="w-3 h-3 text-slate-400" />
          <input
            type="text"
            value={authorName}
            onChange={e => onAuthorNameChange(e.target.value)}
            placeholder="Your name"
            className="text-[12px] text-slate-600 bg-transparent outline-none w-28 placeholder:text-slate-400"
          />
        </div>
        <span className="text-[11px] text-slate-400 ml-auto">⏎ Send · Shift+⏎ newline</span>
      </div>

      {/* Input row */}
      <div className={cn(
        'flex items-end gap-2 bg-slate-50 rounded-xl border ring-2 ring-transparent transition-all duration-150',
        agentAccent[selectedAgent],
        disabled ? 'opacity-60' : ''
      )}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask a tax question..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent resize-none outline-none text-[13px] text-slate-800 placeholder:text-slate-400 px-3.5 py-3 leading-relaxed min-h-[44px] max-h-[160px]"
          style={{ height: '44px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={cn(
            'shrink-0 w-8 h-8 rounded-lg mb-2 mr-2 flex items-center justify-center transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed',
            sendBtnColor[selectedAgent]
          )}
        >
          {disabled
            ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            : <Send className="w-3.5 h-3.5 text-white" />
          }
        </button>
      </div>
    </div>
  )
}
