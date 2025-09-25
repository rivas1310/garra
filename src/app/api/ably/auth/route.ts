import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Para Ably, solo necesitamos el clientId
    // El token se genera automáticamente con la API key
    return NextResponse.json({
      clientId: session.user.id,
      userInfo: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    })
  } catch (error) {
    console.error('Error en autenticación Ably:', error)
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
  }
}
