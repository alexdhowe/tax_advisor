export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { ClientCard } from '@/components/clients/ClientCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ClientType } from '@prisma/client'
import { Users, Plus } from 'lucide-react'

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
      <div className="p-8 max-w-5xl mx-auto animate-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Workspace</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          </div>
          <Link href="/clients/new">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200">
              <Plus className="w-4 h-4" /> New Client
            </Button>
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium mb-1">No clients yet</p>
            <p className="text-slate-400 text-sm mb-5">Create your first client to start advising.</p>
            <Link href="/clients/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Create Client</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(clients as ClientWithCount[]).map(c => <ClientCard key={c.id} client={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
