import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = body
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
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
    
    // Hashear la nueva contraseña
    const hashedPassword = await hash(password, 12)
    
    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { hashedPassword }
    })
    
    // Eliminar el token usado
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    })
    
  } catch (error) {
    log.error('Error al restablecer contraseña:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}