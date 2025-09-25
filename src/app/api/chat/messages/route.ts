import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Enviar mensaje
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { conversationId, content, messageType = 'TEXT', attachmentUrl } = body

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'El contenido del mensaje es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la conversación existe y el usuario tiene acceso
    const conversation = await prisma.chatConversation.findFirst({
      where: session?.user?.id 
        ? {
            id: conversationId,
            OR: [
              { userId: session.user.id },
              // Los admins pueden responder a cualquier conversación
              ...(session.user.role === 'ADMIN' ? [{}] : [])
            ]
          }
        : {
            id: conversationId,
            userId: null // Conversaciones de invitados
          }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversación no encontrada o sin acceso' },
        { status: 404 }
      )
    }

    // Crear el mensaje
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: session?.user?.id || null,
        senderType: session?.user?.role === 'ADMIN' ? 'ADMIN' : 'USER',
        content: content.trim(),
        messageType,
        attachmentUrl
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        }
      }
    })

    // Actualizar la conversación
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date(),
        // Si es un mensaje de admin, marcar como no leído para el usuario
        isRead: session?.user?.role === 'ADMIN' ? false : true
      }
    })

    // TODO: Emitir evento de WebSocket aquí
    // socketIO.to(conversationId).emit('message:new', message)

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error enviando mensaje:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
