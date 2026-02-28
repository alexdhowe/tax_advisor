'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Matter {
  id: string
  clientId: string
  title: string
  description?: string | null
  status: 'active' | 'completed' | 'archived'
  createdAt: string | Date
  _count?: { messages: number; documents: number }
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  archived: 'bg-orange-100 text-orange-700 border-orange-200',
}

export function MatterCard({ matter }: { matter: Matter }) {
  return (
    <Link
      href={`/clients/${matter.clientId}/matters/${matter.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{matter.title}</h3>
        <Badge variant="outline" className={`text-xs border shrink-0 ${statusColors[matter.status]}`}>
          {matter.status}
        </Badge>
      </div>
      {matter.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{matter.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>{new Date(matter.createdAt).toLocaleDateString()}</span>
        {matter._count && (
          <>
            <span>·</span>
            <span>{matter._count.messages} messages</span>
            <span>·</span>
            <span>{matter._count.documents} docs</span>
          </>
        )}
      </div>
    </Link>
  )
}
