import { prisma } from '@/lib/prisma'
import { type MatterStatus } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MatterCard } from '@/components/matters/MatterCard'
import { MatterForm } from '@/components/matters/MatterForm'
import { Building2, User, Handshake, ChevronRight, Hash, StickyNote } from 'lucide-react'

type MatterWithCount = {
  id: string; clientId: string; title: string; description: string | null
  status: MatterStatus; createdAt: Date; _count: { messages: number; documents: number }
}

const typeConfig = {
  individual:  { icon: User,      label: 'Individual',  gradient: 'from-blue-500 to-indigo-500',    bg: 'bg-blue-50',    text: 'text-blue-600'   },
  corporation: { icon: Building2, label: 'Corporation', gradient: 'from-emerald-500 to-teal-500',   bg: 'bg-emerald-50', text: 'text-emerald-600'},
  partnership: { icon: Handshake, label: 'Partnership', gradient: 'from-violet-500 to-purple-500',  bg: 'bg-violet-50',  text: 'text-violet-600' },
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

  const cfg = typeConfig[client.type as keyof typeof typeConfig]
  const Icon = cfg.icon
  const initials = client.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  const activeMatters = (client.matters as MatterWithCount[]).filter(m => m.status === 'active')
  const otherMatters  = (client.matters as MatterWithCount[]).filter(m => m.status !== 'active')

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto animate-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-6">
          <Link href="/clients" className="hover:text-slate-600 transition-colors">Clients</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700 font-medium">{client.name}</span>
        </div>

        {/* Client header card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-8 overflow-hidden">
          {/* Gradient banner */}
          <div className={`h-2 bg-gradient-to-r ${cfg.gradient}`} />
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md`}>
                  <span className="text-lg font-bold text-white">{initials}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">{client.name}</h1>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-slate-500">
                    {client.taxId && (
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {client.taxId}
                      </span>
                    )}
                    <span>Since {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <span>{client.matters.length} matter{client.matters.length !== 1 ? 's' : ''}</span>
                  </div>
                  {client.notes && (
                    <div className="flex items-start gap-1.5 mt-2.5 bg-slate-50 rounded-lg px-3 py-2 max-w-lg">
                      <StickyNote className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-slate-600 leading-relaxed">{client.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              <MatterForm clientId={client.id} />
            </div>
          </div>
        </div>

        {/* Active Matters */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Active Matters</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">{activeMatters.length}</span>
            </div>
          </div>
          {activeMatters.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
              <p className="text-slate-400 text-sm">No active matters. Create one to start advising.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeMatters.map(m => <MatterCard key={m.id} matter={m} />)}
            </div>
          )}
        </section>

        {otherMatters.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Completed & Archived</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">{otherMatters.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherMatters.map(m => <MatterCard key={m.id} matter={m} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
