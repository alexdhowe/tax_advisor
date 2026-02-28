'use client'

import { AgentBadge } from '@/components/agents/AgentBadge'
import { AgentType } from '@/lib/agents'

interface StreamingIndicatorProps {
  agentType: AgentType
  orchestratorStatus?: string
  specialistsCalled?: Array<{ specialist: string; name: string }>
}

export function StreamingIndicator({ agentType, orchestratorStatus, specialistsCalled }: StreamingIndicatorProps) {
  return (
    <div className="flex flex-col gap-2 items-start">
      <div className="flex items-center gap-2 px-1">
        <AgentBadge agentType={agentType} />
        <span className="text-xs text-gray-400">typing...</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
        {agentType === 'orchestrator' ? (
          <div className="flex flex-col gap-2">
            {orchestratorStatus && (
              <p className="text-sm text-gray-500 italic">{orchestratorStatus}</p>
            )}
            {specialistsCalled && specialistsCalled.length > 0 && (
              <div className="flex flex-col gap-1">
                {specialistsCalled.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Consulting {s.name}...
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  )
}
