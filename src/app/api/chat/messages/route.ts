import { NextRequest, NextResponse } from 'next/server'

// POST - Enviar mensaje (versión simplificada para debug)
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API /api/chat/messages llamada desde:', request.url)
    
    const body = await request.json()
    console.log('📨 Datos recibidos:', body)
    
    // Validación básica
    if (!body.conversationId) {
      console.log('❌ conversationId faltante')
      return NextResponse.json(
        { error: 'conversationId es requerido' },
        { status: 400 }
      )
    }
    
    if (!body.content?.trim()) {
      console.log('❌ content faltante')
      return NextResponse.json(
        { error: 'El contenido del mensaje es requerido' },
        { status: 400 }
      )
    }

    // Respuesta temporal para debug
    const mockMessage = {
      id: 'temp-' + Date.now(),
      conversationId: body.conversationId,
      content: body.content,
      senderType: 'ADMIN',
      createdAt: new Date().toISOString(),
      sender: {
        id: 'admin',
        name: 'Admin',
        email: 'admin@garrasfelinas.com',
        role: 'ADMIN'
      }
    }

    console.log('✅ Mensaje mock creado:', mockMessage)
    
    return NextResponse.json(mockMessage, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error en /api/chat/messages:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET - Para testing
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'API de chat funcionando correctamente' }, { status: 200 })
}