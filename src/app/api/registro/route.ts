import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    // Log the raw request for debugging
    const body = await req.text()
    log.error('Raw request body:', body)
    
    // Parse JSON manually with better error handling
    let parsedBody
    try {
      parsedBody = JSON.parse(body)
    } catch (parseError) {
      log.error('JSON parse error:', parseError)
      log.error('Body that failed to parse:', body)
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      )
    }
    
    const { nombre, email, password } = parsedBody
    
    // Validaciones
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      )
    }
    
    // Hashear la contraseña
    const hashedPassword = await hash(password, 12)
    
    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        name: nombre,
        email,
        hashedPassword,
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user
    })
    
  } catch (error) {
    log.error('Error en registro:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}