'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, FileSpreadsheet, File, Upload, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  filename: string
  fileType: string
  createdAt: string | Date
}

interface DocumentListProps {
  matterId: string
  documents: Document[]
  onUpload: (doc: Document) => void
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType.includes('pdf'))
    return <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('xls') || fileType.includes('csv'))
    return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
  return <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
}

export function DocumentList({ matterId, documents, onUpload }: DocumentListProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('matterId', matterId)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
      onUpload(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [matterId, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: uploading,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-3 border-b border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Documents</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 px-3">
            <p className="text-[11px] text-slate-400 text-center">No documents uploaded yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50 px-1 py-1">
            {documents.map(doc => (
              <li key={doc.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                <FileIcon fileType={doc.fileType} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-700 truncate" title={doc.filename}>
                    {doc.filename}
                  </p>
                  <p className="text-[10px] text-slate-400">{formatDate(doc.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Drop zone */}
      <div className="p-3 border-t border-slate-100">
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl px-3 py-4 text-center cursor-pointer transition-all duration-150',
            isDragActive
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              <span className="text-[11px] text-slate-500">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className={cn('w-4 h-4', isDragActive ? 'text-indigo-500' : 'text-slate-400')} />
              <span className="text-[11px] font-medium text-slate-600">
                {isDragActive ? 'Drop to upload' : 'Upload document'}
              </span>
              <span className="text-[10px] text-slate-400">PDF · XLSX · CSV · TXT</span>
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-1.5 mt-2">
            <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
            <p className="text-[10px] text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
