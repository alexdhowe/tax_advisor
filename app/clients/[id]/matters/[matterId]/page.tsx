'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { AgentSelector } from '@/components/agents/AgentSelector'
import { DocumentList } from '@/components/documents/DocumentList'
import { Badge } from '@/components/ui/badge'
import { AgentType } from '@/lib/agents'

interface MatterDetail {
  id: string
  title: string
  description?: string | null
  status: string
  client: {
    id: string
    name: string
    type: string
  }
  documents: Array<{
    id: string
    filename: string
    fileType: string
    createdAt: string | Date
  }>
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  archived: 'bg-orange-100 text-orange-700 border-orange-200',
}

const defaultAgentForClientType: Record<string, AgentType> = {
  individual: 'individual',
  corporation: 'corporate',
  partnership: 'partnership',
}

export default function MatterWorkspacePage() {
  const params = useParams()
  const matterId = params.matterId as string
  const clientId = params.id as string

  const [matter, setMatter] = useState<MatterDetail | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('individual')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatter = async () => {
      try {
        const res = await fetch(`/api/matters/${matterId}`)
        if (!res.ok) return
        const data: MatterDetail = await res.json()
        setMatter(data)
        // Set default agent based on client type
        const defaultAgent = defaultAgentForClientType[data.client.type] || 'individual'
        setSelectedAgent(defaultAgent)
      } catch (err) {
        console.error('Failed to fetch matter:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMatter()
  }, [matterId])

  const handleDocumentUpload = (doc: { id: string; filename: string; fileType: string; createdAt: string | Date }) => {
    setMatter(prev => prev ? { ...prev, documents: [doc, ...prev.documents] } : prev)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading matter...</p>
        </div>
      </div>
    )
  }

  if (!matter) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Matter not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/clients" className="text-sm text-gray-400 hover:text-gray-600">Clients</Link>
          <span className="text-gray-300">/</span>
          <Link href={`/clients/${clientId}`} className="text-sm text-gray-400 hover:text-gray-600">
            {matter.client.name}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-700 font-medium">{matter.title}</span>
          <Badge variant="outline" className={`text-xs border ml-1 ${statusColors[matter.status]}`}>
            {matter.status}
          </Badge>
        </div>
        {matter.description && (
          <p className="text-xs text-gray-400 mt-1">{matter.description}</p>
        )}
      </div>

      {/* Three-panel workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Documents */}
        <div className="w-52 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden">
          <DocumentList
            matterId={matterId}
            documents={matter.documents}
            onUpload={handleDocumentUpload}
          />
        </div>

        {/* Center panel: Chat */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <ChatWindow matterId={matterId} selectedAgent={selectedAgent} />
        </div>

        {/* Right panel: Agent selector */}
        <div className="w-56 border-l border-gray-200 bg-white overflow-y-auto shrink-0">
          <AgentSelector selected={selectedAgent} onChange={setSelectedAgent} />

          {/* Tips */}
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Tips</p>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li>· Upload K-1s, 1040s, or financial statements for context</li>
              <li>· Orchestrator routes to multiple specialists and synthesizes</li>
              <li>· All team members share this chat</li>
              <li>· Enter your name before sending</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
