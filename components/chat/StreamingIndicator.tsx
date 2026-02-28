'use client'

import { AgentBadge } from '@/components/agents/AgentBadge'
import { AgentType } from '@/lib/agents'
import { Sparkles } from 'lucide-react'

interface StreamingIndicatorProps {
  agentType: AgentType
  orchestratorStatus?: string
  specialistsCalled?: Array<{ specialist: string; name: string }>
}

const agentDots: Record<string, string> = {
  individual: 'bg-blue-400',
  corporate: 'bg-emerald-400',
  partnership: 'bg-violet-400',
  orchestrator: 'bg-amber-400',
}

export function StreamingIndicator({ agentType, orchestratorStatus, specialistsCalled }: StreamingIndicatorProps) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2 px-1">
        <AgentBadge agentType={agentType} />
        <span className="text-[10px] text-slate-400">thinking...</span>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 max-w-[72%]">
        {agentType === 'orchestrator' ? (
          <div className="flex flex-col gap-2">
            {orchestratorStatus && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <p className="text-[12px] text-slate-500 italic">{orchestratorStatus}</p>
              </div>
            )}
            {specialistsCalled && specialistsCalled.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {specialistsCalled.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${agentDots[s.specialist] ?? 'bg-slate-400'} animate-pulse`} />
                    <span className="text-[11px] text-slate-500">Consulting {s.name}...</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 py-0.5">
            {[0, 150, 300].map(delay => (
              <span
                key={delay}
                className={`w-1.5 h-1.5 rounded-full ${agentDots[agentType]} animate-bounce`}
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
