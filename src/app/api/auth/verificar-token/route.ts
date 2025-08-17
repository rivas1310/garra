import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      )
    }
    
    // Buscar el token en la base de datos
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })
    
    // Verificar si el token existe y no ha expirado
    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'El token no es válido o ha expirado' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Token válido'
    })
    
  } catch (error) {
    log.error('Error al verificar token:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}