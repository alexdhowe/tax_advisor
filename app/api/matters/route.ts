import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientId, title, description } = body

    if (!clientId || !title) {
      return NextResponse.json({ error: 'clientId and title are required' }, { status: 400 })
    }

    const matter = await prisma.matter.create({
      data: {
        clientId,
        title,
        description: description || null,
      },
    })

    return NextResponse.json(matter, { status: 201 })
  } catch (error) {
    console.error('POST /api/matters error:', error)
    return NextResponse.json({ error: 'Failed to create matter' }, { status: 500 })
  }
}
