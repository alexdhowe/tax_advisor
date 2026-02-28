import { prisma } from '@/lib/prisma'
import { ClientCard } from '@/components/clients/ClientCard'
import { MatterCard } from '@/components/matters/MatterCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ClientType, MatterStatus } from '@prisma/client'

type ClientWithCount = {
  id: string; name: string; type: ClientType; taxId: string | null
  notes: string | null; createdAt: Date; _count: { matters: number }
}
type MatterWithClient = {
  id: string; clientId: string; title: string; description: string | null
  status: MatterStatus; createdAt: Date
  _count: { messages: number; documents: number }
}

export default async function DashboardPage() {
  const [recentClients, recentMatters] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { _count: { select: { matters: true } } },
    }),
    prisma.matter.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        client: true,
        _count: { select: { messages: true, documents: true } },
      },
    }),
  ])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link href="/clients/new">
            <Button>+ New Client</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Clients"
            value={await prisma.client.count()}
            icon="👥"
            color="blue"
          />
          <StatCard
            label="Active Matters"
            value={await prisma.matter.count({ where: { status: 'active' } })}
            icon="📋"
            color="green"
          />
          <StatCard
            label="Documents"
            value={await prisma.document.count()}
            icon="📄"
            color="purple"
          />
        </div>

        {/* Recent Clients */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Clients</h2>
            <Link href="/clients" className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm">No clients yet.</p>
              <Link href="/clients/new">
                <Button variant="outline" size="sm" className="mt-3">Create your first client</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(recentClients as ClientWithCount[]).map(client => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </section>

        {/* Active Matters */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Active Matters</h2>
          </div>
          {recentMatters.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm">No active matters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(recentMatters as MatterWithClient[]).map(matter => (
                <MatterCard key={matter.id} matter={matter} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
  }

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}
