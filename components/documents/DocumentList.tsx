'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'

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
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function fileIcon(fileType: string) {
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('xls')) return '📊'
  if (fileType.includes('csv') || fileType.includes('text')) return '📝'
  return '📎'
}

export function DocumentList({ matterId, documents, onUpload }: DocumentListProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('matterId', matterId)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Upload failed')
        }

        const doc = await res.json()
        onUpload(doc)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setError(msg)
      } finally {
        setUploading(false)
      }
    },
    [matterId, onUpload]
  )

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
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Documents</h3>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <p className="text-xs text-gray-400 text-center p-4">No documents uploaded</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {documents.map(doc => (
              <li key={doc.id} className="flex items-start gap-2 px-3 py-2 hover:bg-gray-50">
                <span className="text-base mt-0.5">{fileIcon(doc.fileType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate" title={doc.filename}>
                    {doc.filename}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(doc.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Upload zone */}
      <div className="p-3 border-t border-gray-200">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">📤</span>
              <span className="text-xs text-gray-500">
                {isDragActive ? 'Drop file here' : 'Upload document'}
              </span>
              <span className="text-xs text-gray-400">PDF, XLSX, CSV, TXT · Max 10MB</span>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
      </div>
    </div>
  )
}
