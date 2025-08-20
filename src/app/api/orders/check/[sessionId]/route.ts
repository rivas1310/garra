import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID es requerido' },
        { status: 400 }
      )
    }

    // Buscar orden existente por stripeSessionId
    const existingOrder = await prisma.order.findFirst({
      where: {
        stripeSessionId: sessionId // Buscar directamente por stripeSessionId
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        createdAt: true
      }
    })

    if (existingOrder) {
      return NextResponse.json(existingOrder)
    } else {
      return NextResponse.json(null)
    }
  } catch (error) {
    console.error('Error al verificar orden existente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}