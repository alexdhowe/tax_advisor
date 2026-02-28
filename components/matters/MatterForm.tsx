'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, AlertCircle } from 'lucide-react'

interface MatterFormProps {
  clientId: string
  onCreated?: (matter: unknown) => void
}

export function MatterForm({ clientId, onCreated }: MatterFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const reset = () => { setTitle(''); setDescription(''); setError(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/matters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, title, description }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create matter')
      const matter = await res.json()
      setOpen(false)
      reset()
      onCreated?.(matter)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create matter')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm">
          <Plus className="w-4 h-4" /> New Matter
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-slate-100 shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Create New Matter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Matter Title *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., 2024 Federal Income Tax Return"
              required
              className="border-slate-200 focus:border-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the tax matter..."
              rows={3}
              className="border-slate-200 focus:border-indigo-300 resize-none text-sm"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-200">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()} className="bg-indigo-600 hover:bg-indigo-700 min-w-[110px]">
              {loading ? 'Creating...' : 'Create Matter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
