'use client'

import { getAllAgents, AgentType } from '@/lib/agents'

interface AgentSelectorProps {
  selected: AgentType
  onChange: (agent: AgentType) => void
}

const agentIcons: Record<string, string> = {
  individual: '👤',
  corporate: '🏢',
  partnership: '🤝',
  orchestrator: '🎯',
}

export function AgentSelector({ selected, onChange }: AgentSelectorProps) {
  const agents = getAllAgents()

  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Select Agent</h3>
      {agents.map(agent => (
        <button
          key={agent.id}
          onClick={() => onChange(agent.id as AgentType)}
          className={`w-full text-left rounded-lg p-3 border transition-all ${
            selected === agent.id
              ? `${agent.badgeColor} border-current shadow-sm`
              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{agentIcons[agent.id]}</span>
            <span className="font-medium text-sm text-gray-900">{agent.name}</span>
            {selected === agent.id && (
              <span className="ml-auto w-2 h-2 rounded-full bg-current opacity-70" />
            )}
          </div>
          <p className="text-xs text-gray-500 leading-snug">{agent.description}</p>
          <p className="text-xs text-gray-400 mt-1">{agent.persona} · {agent.experience}</p>
        </button>
      ))}
    </div>
  )
}
