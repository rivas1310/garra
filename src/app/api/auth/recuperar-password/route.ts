import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendEmail } from '@/lib/email'

// Duración del token: 1 hora
const TOKEN_EXPIRY = 60 * 60 * 1000

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      )
    }
    
    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json(
        { success: true, message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' },
        { status: 200 }
      )
    }
    
    // Generar token aleatorio
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + TOKEN_EXPIRY)
    
    // Guardar el token en la base de datos
    await prisma.passwordResetToken.create({
      data: {
        token,
        expires,
        userId: user.id
      }
    })
    
    // Construir URL de restablecimiento
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/restablecer-password/${token}`
    
    // Enviar email
    await sendEmail({
      to: user.email,
      subject: 'Restablecimiento de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Restablecimiento de contraseña</h2>
          <p>Hola ${user.name},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #d4a574; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer contraseña
            </a>
          </p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.</p>
          <p>Saludos,<br>🐾 El equipo de Garras Felinas 🐾</p>
        </div>
      `
    })
    
    return NextResponse.json({
      success: true,
      message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña'
    })
    
  } catch (error) {
    log.error('Error en recuperación de contraseña:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}