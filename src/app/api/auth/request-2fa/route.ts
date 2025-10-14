import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { send2FACode } from '@/lib/email'
import { log } from '@/lib/secureLogger'

// Función para generar código de 8 dígitos criptográficamente seguro
function generate2FACode(): string {
  const crypto = require('crypto')
  return crypto.randomInt(10000000, 99999999).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validar datos de entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !user.hashedPassword) {
      // No revelar si el usuario existe o no por seguridad
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const isValidPassword = await compare(password, user.hashedPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar rate limiting (máximo 3 códigos por email cada 15 minutos)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    const recentCodes = await prisma.twoFactorCode.count({
      where: {
        email: user.email,
        createdAt: {
          gte: fifteenMinutesAgo
        }
      }
    })

    if (recentCodes >= 3) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espera 15 minutos antes de solicitar otro código.' },
        { status: 429 }
      )
    }

    // Generar nuevo código 2FA
    const code = generate2FACode()
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000) // 3 minutos

    log.info(`🔐 Generando código 2FA para usuario: ${user.email}`)
    log.info(`📧 Código generado: ${code.substring(0, 2)}****${code.substring(6)}`)

    // Limpiar códigos anteriores del usuario (por seguridad)
    await prisma.twoFactorCode.deleteMany({
      where: {
        userId: user.id
      }
    })

    log.info(`🧹 Códigos anteriores eliminados para usuario: ${user.email}`)

    // Guardar nuevo código en la base de datos
    const savedCode = await prisma.twoFactorCode.create({
      data: {
        userId: user.id,
        email: user.email,
        code,
        expiresAt,
      }
    })

    log.info(`✅ Código 2FA guardado en BD: ${savedCode.id}`)

    // Enviar código por email
    const emailSent = await send2FACode(user.email, code, user.name || undefined)

    if (!emailSent) {
      // Si falla el envío del email, eliminar el código de la DB
      await prisma.twoFactorCode.deleteMany({
        where: {
          userId: user.id,
          code
        }
      })

      return NextResponse.json(
        { error: 'Error al enviar el código. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    // Log de seguridad
    log.info(`🔐 Código 2FA solicitado para usuario: ${user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Código de verificación enviado a tu correo electrónico',
      expiresIn: 3 * 60 // 3 minutos en segundos
    })

  } catch (error) {
    log.error('❌ Error en request-2fa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
