import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { log } from '@/lib/secureLogger'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    // Validar datos de entrada
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email y código son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato del código (8 dígitos)
    if (!/^\d{8}$/.test(code)) {
      return NextResponse.json(
        { error: 'El código debe tener exactamente 8 dígitos' },
        { status: 400 }
      )
    }

    log.info(`🔍 Buscando código 2FA: ${code} para email: ${email}`)

    // Buscar código válido en la base de datos
    const twoFactorCode = await prisma.twoFactorCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date() // No expirado
        }
      },
      include: {
        user: true
      }
    })

    log.info(`📋 Código encontrado: ${twoFactorCode ? 'Sí' : 'No'}`)
    if (twoFactorCode) {
      log.info(`   - ID: ${twoFactorCode.id}`)
      log.info(`   - Intentos: ${twoFactorCode.attempts}`)
      log.info(`   - Expira: ${twoFactorCode.expiresAt.toISOString()}`)
    }

    if (!twoFactorCode) {
      log.warn(`❌ Intento fallido de verificación 2FA para: ${email}`)

      return NextResponse.json(
        { error: 'Código inválido o expirado' },
        { status: 401 }
      )
    }

    // Verificar límite de intentos (máximo 3 intentos por código)
    if (twoFactorCode.attempts >= 3) {
      // Marcar código como usado para evitar más intentos
      await prisma.twoFactorCode.update({
        where: {
          id: twoFactorCode.id
        },
        data: {
          isUsed: true
        }
      })

      log.warn(`🚫 Límite de intentos excedido para código 2FA: ${email}`)

      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Solicita un nuevo código.' },
        { status: 429 }
      )
    }

    // Incrementar intentos en el código específico
    await prisma.twoFactorCode.update({
      where: {
        id: twoFactorCode.id
      },
      data: {
        attempts: {
          increment: 1
        }
      }
    })

    // Verificar nuevamente el límite después del incremento
    if (twoFactorCode.attempts + 1 >= 3) {
      // Marcar código como usado si alcanzó el límite
      await prisma.twoFactorCode.update({
        where: {
          id: twoFactorCode.id
        },
        data: {
          isUsed: true
        }
      })

      log.warn(`🚫 Límite de intentos alcanzado para código 2FA: ${email}`)

      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Solicita un nuevo código.' },
        { status: 429 }
      )
    }

    // NO marcar como usado aún - se marcará después del login exitoso
    // Solo retornar la información del usuario para el login
    
    // Log de seguridad
    log.info(`✅ Verificación 2FA exitosa para usuario: ${email}`)

    // Retornar información del usuario para el login
    return NextResponse.json({
      success: true,
      message: 'Código verificado correctamente',
      user: {
        id: twoFactorCode.user.id,
        email: twoFactorCode.user.email,
        name: twoFactorCode.user.name,
        role: twoFactorCode.user.role
      },
      codeId: twoFactorCode.id // Incluir ID del código para marcarlo como usado después
    })

  } catch (error) {
    log.error('❌ Error en verify-2fa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
