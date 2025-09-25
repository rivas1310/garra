import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener conversaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    
    let conversations

    if (isAdmin) {
      // Los admins ven todas las conversaciones
      conversations = await prisma.chatConversation.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          messages: {
            orderBy: { createdAt: 'asc' },
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
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
    } else {
      // Los usuarios solo ven sus conversaciones
      conversations = await prisma.chatConversation.findMany({
        where: { userId: session.user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
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
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
    }

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error obteniendo conversaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva conversación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { subject, name, email } = body

    let conversationData: any = {
      subject: subject || 'Nueva consulta',
      status: 'ACTIVE',
      priority: 'NORMAL'
    }

    if (session?.user?.id) {
      // Usuario registrado
      conversationData.userId = session.user.id
    } else {
      // Usuario invitado
      if (!name || !email) {
        return NextResponse.json(
          { error: 'Nombre y email son requeridos para usuarios invitados' },
          { status: 400 }
        )
      }
      conversationData.guestName = name
      conversationData.guestEmail = email
    }

    const conversation = await prisma.chatConversation.create({
      data: conversationData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        messages: {
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
        }
      }
    })

    // Crear mensaje de bienvenida del sistema
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: 'SYSTEM',
        content: `¡Hola ${session?.user?.name || name}! Gracias por contactarnos. Un miembro de nuestro equipo te responderá pronto.`,
        messageType: 'SYSTEM'
      }
    })

    // Notificar a los administradores (esto se manejará con WebSockets)
    // TODO: Implementar notificación en tiempo real

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creando conversación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
