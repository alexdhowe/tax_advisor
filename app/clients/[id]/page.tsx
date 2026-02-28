import { prisma } from '@/lib/prisma'
import { type MatterStatus } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MatterCard } from '@/components/matters/MatterCard'
import { MatterForm } from '@/components/matters/MatterForm'

type MatterWithCount = {
  id: string
  clientId: string
  title: string
  description: string | null
  status: MatterStatus
  createdAt: Date
  _count: { messages: number; documents: number }
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

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      matters: {
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { messages: true, documents: true } } },
      },
    },
  })

  if (!client) notFound()

  const activeMatters = (client.matters as MatterWithCount[]).filter(m => m.status === 'active')
  const otherMatters = (client.matters as MatterWithCount[]).filter(m => m.status !== 'active')

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/clients" className="hover:text-gray-600">Clients</Link>
          <span>/</span>
          <span className="text-gray-600">{client.name}</span>
        </div>

        {/* Client Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{typeIcons[client.type]}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                  <Badge variant="outline" className={`border ${typeColors[client.type]}`}>
                    {client.type}
                  </Badge>
                </div>
                {client.taxId && (
                  <p className="text-sm text-gray-500">TIN: {client.taxId}</p>
                )}
                {client.notes && (
                  <p className="text-sm text-gray-600 mt-2 max-w-2xl">{client.notes}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Client since {new Date(client.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <MatterForm clientId={client.id} />
          </div>
        </div>

        {/* Active Matters */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              Active Matters <span className="text-gray-400 font-normal">({activeMatters.length})</span>
            </h2>
          </div>
          {activeMatters.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm">No active matters. Create one to start advising.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeMatters.map(matter => (
                <MatterCard key={matter.id} matter={matter} />
              ))}
            </div>
          )}
        </section>

        {/* Completed / Archived Matters */}
        {otherMatters.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Completed & Archived <span className="text-gray-400 font-normal">({otherMatters.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherMatters.map(matter => (
                <MatterCard key={matter.id} matter={matter} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
