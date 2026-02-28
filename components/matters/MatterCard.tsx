'use client'

import Link from 'next/link'
import { MessageSquare, FileText, ArrowUpRight, Circle } from 'lucide-react'

interface Matter {
  id: string
  clientId: string
  title: string
  description?: string | null
  status: 'active' | 'completed' | 'archived'
  createdAt: string | Date
  _count?: { messages: number; documents: number }
}

const statusConfig = {
  active:    { label: 'Active',    dot: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  completed: { label: 'Completed', dot: 'bg-slate-400',   text: 'text-slate-500',   bg: 'bg-slate-50'   },
  archived:  { label: 'Archived',  dot: 'bg-amber-400',   text: 'text-amber-600',   bg: 'bg-amber-50'   },
}

export function MatterCard({ matter }: { matter: Matter }) {
  const cfg = statusConfig[matter.status]

  return (
    <Link href={`/clients/${matter.clientId}/matters/${matter.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 h-full flex flex-col">
        {/* Status + title */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 flex-1">{matter.title}</h3>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
        </div>

        {/* Status pill */}
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${cfg.bg} w-fit mb-2`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={`text-[10px] font-semibold ${cfg.text} uppercase tracking-wide`}>{cfg.label}</span>
        </div>

        {matter.description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 flex-1">{matter.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
          <span className="text-[11px] text-slate-400">
            {new Date(matter.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {matter._count && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MessageSquare className="w-3 h-3" />
                <span>{matter._count.messages}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <FileText className="w-3 h-3" />
                <span>{matter._count.documents}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
