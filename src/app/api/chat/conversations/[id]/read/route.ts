import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Marcar conversación como leída
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    
    // Verificar que el usuario tenga acceso a esta conversación
    const conversation = await prisma.chatConversation.findFirst({
      where: isAdmin ? { id } : { id, userId: session.user.id }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 }
      )
    }

    // Marcar la conversación como leída
    await prisma.chatConversation.update({
      where: { id },
      data: { isRead: true }
    })

    // Marcar todos los mensajes como leídos
    await prisma.chatMessage.updateMany({
      where: { 
        conversationId: id,
        // Solo marcar como leídos los mensajes que no son del usuario actual
        senderId: { not: session.user.id }
      },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marcando como leído:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
