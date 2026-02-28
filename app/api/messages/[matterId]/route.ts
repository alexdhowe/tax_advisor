import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ matterId: string }> }) {
  try {
    const { matterId } = await params
    const messages = await prisma.message.findMany({
      where: { matterId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('GET /api/messages/[matterId] error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
