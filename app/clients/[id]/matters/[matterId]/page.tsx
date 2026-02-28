'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { AgentSelector } from '@/components/agents/AgentSelector'
import { DocumentList } from '@/components/documents/DocumentList'
import { AgentType } from '@/lib/agents'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MatterDetail {
  id: string
  title: string
  description?: string | null
  status: string
  client: { id: string; name: string; type: string }
  documents: Array<{ id: string; filename: string; fileType: string; createdAt: string | Date }>
}

const statusConfig: Record<string, { dot: string; text: string; bg: string }> = {
  active:    { dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  completed: { dot: 'bg-slate-400',   text: 'text-slate-600',   bg: 'bg-slate-100'  },
  archived:  { dot: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
}

const defaultAgentForType: Record<string, AgentType> = {
  individual: 'individual', corporation: 'corporate', partnership: 'partnership',
}

export default function MatterWorkspacePage() {
  const params = useParams()
  const matterId = params.matterId as string
  const clientId = params.id as string

  const [matter, setMatter] = useState<MatterDetail | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('individual')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/matters/${matterId}`)
      .then(r => r.json())
      .then((data: MatterDetail) => {
        setMatter(data)
        setSelectedAgent(defaultAgentForType[data.client.type] ?? 'individual')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [matterId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading workspace...</p>
        </div>
      </div>
    )
  }

  if (!matter) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">Matter not found.</p>
      </div>
    )
  }

  const statusCfg = statusConfig[matter.status] ?? statusConfig.active

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-5 py-3 shrink-0 flex items-center gap-0 min-w-0">
        <div className="flex items-center gap-1.5 text-[12px] min-w-0 flex-1">
          <Link href="/clients" className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">Clients</Link>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <Link href={`/clients/${clientId}`} className="text-slate-400 hover:text-slate-600 transition-colors truncate max-w-[120px]">
            {matter.client.name}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="text-slate-800 font-semibold truncate">{matter.title}</span>
        </div>
        <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0 ml-3', statusCfg.bg)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
          <span className={cn('text-[10px] font-semibold uppercase tracking-wide', statusCfg.text)}>
            {matter.status}
          </span>
        </div>
      </div>

      {/* Three panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Documents */}
        <div className="w-48 border-r border-slate-100 bg-white flex flex-col shrink-0 overflow-hidden">
          <DocumentList
            matterId={matterId}
            documents={matter.documents}
            onUpload={doc => setMatter(prev => prev ? { ...prev, documents: [doc, ...prev.documents] } : prev)}
          />
        </div>

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow matterId={matterId} selectedAgent={selectedAgent} />
        </div>

        {/* Right: Agent selector */}
        <div className="w-52 border-l border-slate-100 bg-white flex flex-col shrink-0 overflow-hidden">
          <AgentSelector selected={selectedAgent} onChange={setSelectedAgent} />
        </div>
      </div>
    </div>
  )
}
