import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ClientType } from '@prisma/client'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { matters: true } },
      },
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error('GET /api/clients error:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, taxId, notes } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'name and type are required' }, { status: 400 })
    }

    if (!['individual', 'corporation', 'partnership'].includes(type)) {
      return NextResponse.json({ error: 'Invalid client type' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        type: type as ClientType,
        taxId: taxId || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
