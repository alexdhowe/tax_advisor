import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MatterStatus } from '@prisma/client'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const matter = await prisma.matter.findUnique({
      where: { id },
      include: {
        client: true,
        documents: { orderBy: { createdAt: 'desc' } },
        _count: { select: { messages: true } },
      },
    })

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    return NextResponse.json(matter)
  } catch (error) {
    console.error('GET /api/matters/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch matter' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, description, status } = body

    const matter = await prisma.matter.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status: status as MatterStatus }),
      },
    })

    return NextResponse.json(matter)
  } catch (error) {
    console.error('PATCH /api/matters/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update matter' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.matter.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/matters/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete matter' }, { status: 500 })
  }
}
