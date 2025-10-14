import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { log } from '@/lib/secureLogger'

export async function POST(req: NextRequest) {
  try {
    const { codeId, email } = await req.json()

    if (!codeId || !email) {
      return NextResponse.json(
        { error: 'ID del código y email son requeridos' },
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

    // Buscar y validar que el código pertenece al email
    const existingCode = await prisma.twoFactorCode.findFirst({
      where: {
        id: codeId,
        email: email.toLowerCase(),
        isUsed: false
      }
    })

    if (!existingCode) {
      return NextResponse.json(
        { error: 'Código no encontrado o ya usado' },
        { status: 404 }
      )
    }

    // Marcar código como usado
    const updatedCode = await prisma.twoFactorCode.update({
      where: {
        id: codeId
      },
      data: {
        isUsed: true
      }
    })

    // Limpiar códigos antiguos del usuario
    await prisma.twoFactorCode.deleteMany({
      where: {
        userId: updatedCode.userId,
        isUsed: true
      }
    })

    log.info(`✅ Código 2FA marcado como usado: ${updatedCode.id}`)

    return NextResponse.json({
      success: true,
      message: 'Código marcado como usado correctamente'
    })

  } catch (error) {
    log.error('❌ Error en mark-code-used:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
