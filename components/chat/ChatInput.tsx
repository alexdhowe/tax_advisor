'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AgentType } from '@/lib/agents'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  selectedAgent: AgentType
  authorName: string
  onAuthorNameChange: (name: string) => void
}

export function ChatInput({ onSend, disabled, selectedAgent, authorName, onAuthorNameChange }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setMessage('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const agentColors: Record<AgentType, string> = {
    individual: 'border-blue-300 focus:ring-blue-200',
    corporate: 'border-green-300 focus:ring-green-200',
    partnership: 'border-purple-300 focus:ring-purple-200',
    orchestrator: 'border-amber-300 focus:ring-amber-200',
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs text-gray-500 whitespace-nowrap">Author:</label>
        <input
          type="text"
          value={authorName}
          onChange={e => onAuthorNameChange(e.target.value)}
          placeholder="Your name"
          className="text-xs border border-gray-200 rounded px-2 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-blue-200"
        />
        <span className="text-xs text-gray-400 ml-auto">Shift+Enter for newline</span>
      </div>
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask the ${selectedAgent === 'orchestrator' ? 'Orchestrator' : selectedAgent + ' tax expert'} a question...`}
          className={`min-h-[60px] max-h-[200px] resize-none border ${agentColors[selectedAgent]} focus-visible:ring-1`}
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="h-10 px-4 shrink-0"
        >
          {disabled ? (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </span>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  )
}
