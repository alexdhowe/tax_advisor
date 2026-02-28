'use client'

import { Badge } from '@/components/ui/badge'
import { agentRegistry, AgentType } from '@/lib/agents'

interface AgentBadgeProps {
  agentType: AgentType | string
  size?: 'sm' | 'md'
}

export function AgentBadge({ agentType, size = 'sm' }: AgentBadgeProps) {
  const agent = agentRegistry[agentType as AgentType]
  if (!agent) return null

  return (
    <Badge
      variant="outline"
      className={`${agent.badgeColor} font-medium border ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
    >
      {agent.name}
    </Badge>
  )
}
