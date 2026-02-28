'use client'

import { AgentType, agentRegistry } from '@/lib/agents'
import { cn } from '@/lib/utils'

const badgeStyles: Record<string, string> = {
  individual:   'bg-blue-50 text-blue-700 border-blue-100',
  corporate:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  partnership:  'bg-violet-50 text-violet-700 border-violet-100',
  orchestrator: 'bg-amber-50 text-amber-700 border-amber-100',
}

const dotColors: Record<string, string> = {
  individual:   'bg-blue-500',
  corporate:    'bg-emerald-500',
  partnership:  'bg-violet-500',
  orchestrator: 'bg-amber-500',
}

interface AgentBadgeProps {
  agentType: AgentType | string
}

export function AgentBadge({ agentType }: AgentBadgeProps) {
  const agent = agentRegistry[agentType as AgentType]
  if (!agent) return null

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold',
      badgeStyles[agentType]
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[agentType])} />
      {agent.name}
    </span>
  )
}
