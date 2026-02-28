import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ClientType } from '@prisma/client'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, type, taxId, notes } = body

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type: type as ClientType }),
        ...(taxId !== undefined && { taxId }),
        ...(notes !== undefined && { notes }),
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('PATCH /api/clients/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
