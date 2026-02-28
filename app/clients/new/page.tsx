'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ChevronRight, User, Building2, Handshake, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const clientTypes = [
  {
    value: 'individual' as const,
    label: 'Individual',
    description: 'Personal income tax, 1040, capital gains, retirement',
    icon: User,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    selectedBorder: 'border-blue-500',
    selectedBg: 'bg-blue-50',
  },
  {
    value: 'corporation' as const,
    label: 'Corporation',
    description: 'C-corp, GILTI/BEAT/FDII, M&A, NOLs, §382',
    icon: Building2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    selectedBorder: 'border-emerald-500',
    selectedBg: 'bg-emerald-50',
  },
  {
    value: 'partnership' as const,
    label: 'Partnership / LLC',
    description: 'Subchapter K, §704(b/c), S-corps, PTET elections',
    icon: Handshake,
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    selectedBorder: 'border-violet-500',
    selectedBg: 'bg-violet-50',
  },
]

export default function NewClientPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState<'individual' | 'corporation' | 'partnership'>('individual')
  const [taxId, setTaxId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, taxId: taxId || undefined, notes: notes || undefined }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create client')
      const client = await res.json()
      router.push(`/clients/${client.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create client')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-2xl mx-auto animate-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-6">
          <Link href="/clients" className="hover:text-slate-600 transition-colors">Clients</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">New Client</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Create New Client</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client name */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Client Name *</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., John Smith or Acme Corp"
              required
              className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-100"
            />
          </div>

          {/* Client type */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <label className="block text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Client Type *</label>
            <div className="grid grid-cols-1 gap-2.5">
              {clientTypes.map(ct => {
                const Icon = ct.icon
                const isSelected = type === ct.value
                return (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setType(ct.value)}
                    className={cn(
                      'flex items-center gap-3.5 p-3.5 rounded-xl border-2 text-left transition-all duration-150',
                      isSelected ? `${ct.selectedBorder} ${ct.selectedBg}` : 'border-slate-100 hover:border-slate-200 bg-white'
                    )}
                  >
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', ct.iconBg)}>
                      <Icon className={cn('w-4.5 h-4.5', ct.iconColor)} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{ct.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ct.description}</p>
                    </div>
                    <div className={cn('ml-auto w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
                      isSelected ? `${ct.selectedBorder} ${ct.selectedBg}` : 'border-slate-300'
                    )}>
                      {isSelected && <span className={cn('w-2 h-2 rounded-full', ct.iconColor.replace('text-', 'bg-'))} />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Optional fields */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Tax ID (SSN / EIN)</label>
              <Input
                value={taxId}
                onChange={e => setTaxId(e.target.value)}
                placeholder="XX-XXXXXXX"
                className="border-slate-200 focus:border-indigo-300 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">Optional — for reference only</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Notes</label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Filing status, state of residence, entity state, key facts..."
                rows={3}
                className="border-slate-200 focus:border-indigo-300 resize-none text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Link href="/clients">
              <Button type="button" variant="outline" className="border-slate-200">Cancel</Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
            >
              {loading ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
