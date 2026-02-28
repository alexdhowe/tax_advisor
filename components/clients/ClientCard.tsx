'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Client {
  id: string
  name: string
  type: 'individual' | 'corporation' | 'partnership'
  taxId?: string | null
  notes?: string | null
  createdAt: string | Date
  _count?: { matters: number }
}

const typeColors: Record<string, string> = {
  individual: 'bg-blue-100 text-blue-700 border-blue-200',
  corporation: 'bg-green-100 text-green-700 border-green-200',
  partnership: 'bg-purple-100 text-purple-700 border-purple-200',
}

const typeIcons: Record<string, string> = {
  individual: '👤',
  corporation: '🏢',
  partnership: '🤝',
}

export function ClientCard({ client }: { client: Client }) {
  return (
    <Link
      href={`/clients/${client.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{typeIcons[client.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{client.name}</h3>
            <Badge variant="outline" className={`text-xs border ${typeColors[client.type]}`}>
              {client.type}
            </Badge>
          </div>
          {client.taxId && <p className="text-xs text-gray-400">TIN: {client.taxId}</p>}
          {client.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{client.notes}</p>}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>{new Date(client.createdAt).toLocaleDateString()}</span>
            {client._count && (
              <>
                <span>·</span>
                <span>{client._count.matters} matter{client._count.matters !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
