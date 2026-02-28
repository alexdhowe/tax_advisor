import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTextFromFile, ensureUploadDir, getUploadDir } from '@/lib/documents'
import path from 'path'
import { writeFile } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv', 'text/plain']
const ALLOWED_EXTS = ['.pdf', '.xlsx', '.xls', '.csv', '.txt']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  try {
    await ensureUploadDir()

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const matterId = formData.get('matterId') as string | null

    if (!file || !matterId) {
      return NextResponse.json({ error: 'file and matterId are required' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ error: `Unsupported file type. Allowed: ${ALLOWED_EXTS.join(', ')}` }, { status: 400 })
    }

    // Verify matter exists
    const matter = await prisma.matter.findUnique({ where: { id: matterId } })
    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    // Save file to disk
    const uniqueFilename = `${uuidv4()}${ext}`
    const uploadDir = getUploadDir()
    const filePath = path.join(uploadDir, uniqueFilename)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Extract text
    const extractedText = await extractTextFromFile(filePath, file.type)

    // Save document record
    const document = await prisma.document.create({
      data: {
        matterId,
        filename: file.name,
        fileType: file.type || `application/${ext.slice(1)}`,
        filePath,
        extractedText,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
