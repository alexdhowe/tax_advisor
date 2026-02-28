'use client'

import { getAllAgents, AgentType } from '@/lib/agents'
import { cn } from '@/lib/utils'

interface AgentSelectorProps {
  selected: AgentType
  onChange: (agent: AgentType) => void
}

const agentStyles: Record<string, {
  gradient: string
  border: string
  activeBg: string
  activeText: string
  dotColor: string
  avatar: string
}> = {
  individual:  {
    gradient: 'from-blue-500 to-indigo-500',
    border: 'border-blue-200',
    activeBg: 'bg-blue-50',
    activeText: 'text-blue-700',
    dotColor: 'bg-blue-500',
    avatar: 'bg-gradient-to-br from-blue-400 to-indigo-500',
  },
  corporate: {
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-200',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
    avatar: 'bg-gradient-to-br from-emerald-400 to-teal-500',
  },
  partnership: {
    gradient: 'from-violet-500 to-purple-500',
    border: 'border-violet-200',
    activeBg: 'bg-violet-50',
    activeText: 'text-violet-700',
    dotColor: 'bg-violet-500',
    avatar: 'bg-gradient-to-br from-violet-400 to-purple-500',
  },
  orchestrator: {
    gradient: 'from-amber-500 to-orange-500',
    border: 'border-amber-200',
    activeBg: 'bg-amber-50',
    activeText: 'text-amber-700',
    dotColor: 'bg-amber-500',
    avatar: 'bg-gradient-to-br from-amber-400 to-orange-500',
  },
}

const agentInitials: Record<string, string> = {
  individual: 'SC',
  corporate: 'MT',
  partnership: 'JW',
  orchestrator: 'LP',
}

export function AgentSelector({ selected, onChange }: AgentSelectorProps) {
  const agents = getAllAgents()

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Select Agent</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {agents.map(agent => {
          const style = agentStyles[agent.id]
          const isSelected = selected === agent.id

          return (
            <button
              key={agent.id}
              onClick={() => onChange(agent.id as AgentType)}
              className={cn(
                'w-full text-left rounded-xl p-3 border transition-all duration-150 group',
                isSelected
                  ? `${style.activeBg} ${style.border} shadow-sm`
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              )}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg ${style.avatar} flex items-center justify-center shrink-0 shadow-sm`}>
                  <span className="text-[10px] font-bold text-white">{agentInitials[agent.id]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-semibold leading-tight truncate', isSelected ? style.activeText : 'text-slate-700')}>
                    {agent.name}
                  </p>
                </div>
                {isSelected && (
                  <div className={`w-2 h-2 rounded-full ${style.dotColor} shrink-0`} />
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{agent.description}</p>
            </button>
          )
        })}
      </div>

      {/* Tips */}
      <div className="p-3 border-t border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Tips</p>
        <ul className="space-y-1.5">
          {[
            'Upload K-1s, 1040s, or financials',
            'Orchestrator routes to specialists',
            'All team members share this chat',
            'Set your name before sending',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-snug">
              <span className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
