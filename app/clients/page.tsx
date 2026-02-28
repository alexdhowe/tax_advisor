import { prisma } from '@/lib/prisma'
import { ClientCard } from '@/components/clients/ClientCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ClientType } from '@prisma/client'

type ClientWithCount = {
  id: string; name: string; type: ClientType; taxId: string | null
  notes: string | null; createdAt: Date; _count: { matters: number }
}

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { matters: true } } },
  })

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/clients/new">
            <Button>+ New Client</Button>
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-3">No clients yet. Create your first client to get started.</p>
            <Link href="/clients/new">
              <Button>Create Client</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(clients as ClientWithCount[]).map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
