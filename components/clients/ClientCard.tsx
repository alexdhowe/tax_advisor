'use client'

import Link from 'next/link'
import { Building2, User, Handshake, FileStack, ArrowUpRight } from 'lucide-react'

interface Client {
  id: string
  name: string
  type: 'individual' | 'corporation' | 'partnership'
  taxId?: string | null
  notes?: string | null
  createdAt: string | Date
  _count?: { matters: number }
}

const typeConfig = {
  individual:  { icon: User,      label: 'Individual',   bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   dot: 'bg-blue-500'   },
  corporation: { icon: Building2, label: 'Corporation',  bg: 'bg-emerald-50',text: 'text-emerald-600',border: 'border-emerald-100', dot: 'bg-emerald-500'},
  partnership: { icon: Handshake, label: 'Partnership',  bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100',  dot: 'bg-violet-500' },
}

export function ClientCard({ client }: { client: Client }) {
  const cfg = typeConfig[client.type]
  const Icon = cfg.icon
  const initials = client.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Link href={`/clients/${client.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
            <span className={`text-sm font-bold ${cfg.text}`}>{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">{client.name}</h3>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
            </div>

            {/* Type badge */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <span className={`text-[11px] font-medium ${cfg.text}`}>{cfg.label}</span>
            </div>

            {client.taxId && (
              <p className="text-[11px] text-slate-400 mt-1 font-mono">TIN: {client.taxId}</p>
            )}
            {client.notes && (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{client.notes}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <span className="text-[11px] text-slate-400">
            {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {client._count !== undefined && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <FileStack className="w-3 h-3" />
              <span>{client._count.matters} matter{client._count.matters !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
