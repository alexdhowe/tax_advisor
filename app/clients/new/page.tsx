'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

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

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create client')
      }

      const client = await res.json()
      router.push(`/clients/${client.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create client'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/clients" className="hover:text-gray-600">Clients</Link>
          <span>/</span>
          <span className="text-gray-600">New Client</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Client</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Client Name *</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., John Smith or Acme Corp"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Client Type *</label>
            <Select value={type} onValueChange={v => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">👤 Individual</SelectItem>
                <SelectItem value="corporation">🏢 Corporation (C-Corp)</SelectItem>
                <SelectItem value="partnership">🤝 Partnership / LLC / S-Corp</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              {type === 'individual' && 'Routes to Individual Tax Expert by default'}
              {type === 'corporation' && 'Routes to Corporate Tax Expert by default'}
              {type === 'partnership' && 'Routes to Partnership Tax Expert by default'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Tax ID (SSN / EIN)</label>
            <Input
              value={taxId}
              onChange={e => setTaxId(e.target.value)}
              placeholder="XX-XXXXXXX"
            />
            <p className="text-xs text-gray-400">Optional — for matter identification only, not stored for security</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Key client facts, filing status, state of residence, entity state..."
              rows={4}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/clients">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
