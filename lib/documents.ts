import 'server-only'
import path from 'path'
import fs from 'fs/promises'

const MAX_DOC_CHARS = 8000
const MAX_TOTAL_CHARS = 40000

export async function extractTextFromFile(
  filePath: string,
  fileType: string
): Promise<string> {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.txt' || ext === '.csv') {
    const content = await fs.readFile(filePath, 'utf-8')
    return content.slice(0, MAX_DOC_CHARS)
  }

  if (ext === '.pdf') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const buffer = await fs.readFile(filePath)
      const data = await pdfParse(buffer)
      const text = data.text || ''
      if (!text.trim()) {
        return '[Note: This PDF appears to be scanned/image-based. OCR is required to extract text. Please provide a text-based PDF or re-upload as a text file.]'
      }
      return text.slice(0, MAX_DOC_CHARS)
    } catch (err) {
      console.error('PDF parse error:', err)
      return '[Error: Could not extract text from PDF. The file may be corrupted or password-protected.]'
    }
  }

  if (ext === '.xlsx' || ext === '.xls') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const XLSX = require('xlsx')
      const buffer = await fs.readFile(filePath)
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheets: string[] = []
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        sheets.push(`=== Sheet: ${sheetName} ===\n${csv}`)
      }
      return sheets.join('\n\n').slice(0, MAX_DOC_CHARS)
    } catch (err) {
      console.error('XLSX parse error:', err)
      return '[Error: Could not extract text from spreadsheet.]'
    }
  }

  return `[Unsupported file type: ${ext}]`
}

export interface DocumentContext {
  filename: string
  fileType: string
  extractedText: string | null
}

export function buildDocumentContext(documents: DocumentContext[]): string {
  if (documents.length === 0) return ''

  const sections: string[] = []
  let totalChars = 0

  for (const doc of documents) {
    if (totalChars >= MAX_TOTAL_CHARS) break
    if (!doc.extractedText) continue

    const truncated = doc.extractedText.slice(0, Math.min(MAX_DOC_CHARS, MAX_TOTAL_CHARS - totalChars))
    sections.push(`### Document: ${doc.filename}\n${truncated}`)
    totalChars += truncated.length
  }

  if (sections.length === 0) return ''

  return `## UPLOADED DOCUMENTS FOR THIS MATTER\n\nThe following documents have been uploaded and extracted. Reference them when answering questions.\n\n${sections.join('\n\n---\n\n')}`
}

export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
}

export async function ensureUploadDir(): Promise<void> {
  const dir = getUploadDir()
  await fs.mkdir(dir, { recursive: true })
}
