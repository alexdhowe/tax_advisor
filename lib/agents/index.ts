import { individualAgentConfig, INDIVIDUAL_AGENT_ID } from './individual'
import { corporateAgentConfig, CORPORATE_AGENT_ID } from './corporate'
import { partnershipAgentConfig, PARTNERSHIP_AGENT_ID } from './partnership'
import { orchestratorAgentConfig, ORCHESTRATOR_AGENT_ID } from './orchestrator-config'

export type AgentType = 'individual' | 'corporate' | 'partnership' | 'orchestrator'

export const AGENT_IDS = {
  INDIVIDUAL: INDIVIDUAL_AGENT_ID,
  CORPORATE: CORPORATE_AGENT_ID,
  PARTNERSHIP: PARTNERSHIP_AGENT_ID,
  ORCHESTRATOR: ORCHESTRATOR_AGENT_ID,
} as const

export const agentRegistry = {
  [INDIVIDUAL_AGENT_ID]: individualAgentConfig,
  [CORPORATE_AGENT_ID]: corporateAgentConfig,
  [PARTNERSHIP_AGENT_ID]: partnershipAgentConfig,
  [ORCHESTRATOR_AGENT_ID]: orchestratorAgentConfig,
}

export type AgentConfig = typeof individualAgentConfig

export function getAgent(id: AgentType): AgentConfig {
  const agent = agentRegistry[id]
  if (!agent) throw new Error(`Agent not found: ${id}`)
  return agent
}

export function getAllAgents() {
  return Object.values(agentRegistry)
}

export { individualAgentConfig, corporateAgentConfig, partnershipAgentConfig, orchestratorAgentConfig }
