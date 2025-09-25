import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Enviar mensaje
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API /api/chat/messages llamada')
    
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    console.log('📨 Datos recibidos:', body)
    console.log('👤 Sesión:', session?.user?.id)

    if (!body.conversationId) {
      return NextResponse.json(
        { error: 'conversationId es requerido' },
        { status: 400 }
      )
    }

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: 'El contenido del mensaje es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la conversación existe y el usuario tiene acceso
    const conversation = await prisma.chatConversation.findFirst({
      where: session?.user?.id 
        ? {
            id: body.conversationId,
            OR: [
              { userId: session.user.id },
              // Los admins pueden responder a cualquier conversación
              ...(session.user.role === 'ADMIN' || session.user.role === 'VENDEDOR' ? [{}] : [])
            ]
          }
        : {
            id: body.conversationId,
            userId: null // Conversaciones de invitados
          }
    })

    if (!conversation) {
      console.log('❌ Conversación no encontrada:', body.conversationId)
      return NextResponse.json(
        { error: 'Conversación no encontrada o sin acceso' },
        { status: 404 }
      )
    }

    console.log('✅ Conversación encontrada:', conversation.id)

    // Crear el mensaje
    const message = await prisma.chatMessage.create({
      data: {
        conversationId: body.conversationId,
        senderId: session?.user?.id || null,
        senderType: session?.user?.role === 'ADMIN' || session?.user?.role === 'VENDEDOR' ? 'ADMIN' : 'USER',
        content: body.content.trim(),
        messageType: 'TEXT'
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

    console.log('✅ Mensaje creado:', message.id)

    // Actualizar la conversación
    await prisma.chatConversation.update({
      where: { id: body.conversationId },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date(),
        // Si es un mensaje de admin, marcar como no leído para el usuario
        isRead: session?.user?.role === 'ADMIN' || session?.user?.role === 'VENDEDOR' ? false : true
      }
    })

    console.log('✅ Conversación actualizada')

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('❌ Error en /api/chat/messages:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}