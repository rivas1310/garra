import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar qué variables de entorno están disponibles
    const emailVars = {
      SMTP_HOST: process.env.SMTP_HOST || 'NO CONFIGURADA',
      SMTP_PORT: process.env.SMTP_PORT || 'NO CONFIGURADA', 
      SMTP_USER: process.env.SMTP_USER || 'NO CONFIGURADA',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '*'.repeat(process.env.SMTP_PASSWORD.length) : 'NO CONFIGURADA',
      SMTP_SECURE: process.env.SMTP_SECURE || 'NO CONFIGURADA',
      SMTP_FROM: process.env.SMTP_FROM || 'NO CONFIGURADA'
    }

    return NextResponse.json({
      success: true,
      message: 'Variables de entorno de email',
      variables: emailVars,
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error al verificar variables de entorno',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
