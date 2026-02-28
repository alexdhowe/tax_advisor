export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { ClientCard } from '@/components/clients/ClientCard'
import { MatterCard } from '@/components/matters/MatterCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ClientType, MatterStatus } from '@prisma/client'
import { Users, FolderOpen, FileText, ArrowRight, Plus, TrendingUp } from 'lucide-react'

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
  const [recentClients, recentMatters, totalClients, activeMatters, totalDocs] = await Promise.all([
    prisma.client.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { _count: { select: { matters: true } } } }),
    prisma.matter.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' }, take: 6, include: { client: true, _count: { select: { messages: true, documents: true } } } }),
    prisma.client.count(),
    prisma.matter.count({ where: { status: 'active' } }),
    prisma.document.count(),
  ])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto animate-in">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-1">{today}</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          </div>
          <Link href="/clients/new">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200">
              <Plus className="w-4 h-4" /> New Client
            </Button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard label="Total Clients" value={totalClients} icon={Users}
            gradient="from-blue-500 to-indigo-600" bg="bg-blue-50" iconBg="bg-blue-500" />
          <StatCard label="Active Matters" value={activeMatters} icon={FolderOpen}
            gradient="from-emerald-500 to-teal-600" bg="bg-emerald-50" iconBg="bg-emerald-500" />
          <StatCard label="Documents" value={totalDocs} icon={FileText}
            gradient="from-violet-500 to-purple-600" bg="bg-violet-50" iconBg="bg-violet-500" />
        </div>

        {/* Recent Clients */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Recent Clients</h2>
            </div>
            <Link href="/clients" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <EmptyState message="No clients yet." action={{ label: 'Create your first client', href: '/clients/new' }} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(recentClients as ClientWithCount[]).map(c => <ClientCard key={c.id} client={c} />)}
            </div>
          )}
        </section>

        {/* Active Matters */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Active Matters</h2>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">{activeMatters}</span>
          </div>
          {recentMatters.length === 0 ? (
            <EmptyState message="No active matters." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(recentMatters as MatterWithClient[]).map(m => <MatterCard key={m.id} matter={m} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, gradient, bg, iconBg }: {
  label: string; value: number; icon: React.ElementType
  gradient: string; bg: string; iconBg: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2} />
        </div>
        <div className={`h-1 w-10 rounded-full bg-gradient-to-r ${gradient} opacity-40 group-hover:opacity-70 transition-opacity`} />
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function EmptyState({ message, action }: { message: string; action?: { label: string; href: string } }) {
  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
      <p className="text-slate-400 text-sm">{message}</p>
      {action && (
        <Link href={action.href}>
          <Button variant="outline" size="sm" className="mt-3 text-xs">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  )
}
