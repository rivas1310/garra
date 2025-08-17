import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/lib/prisma'

// GET /api/cupones - Obtener todos los cupones
export async function GET() {
  try {
    // Verificar autenticación y permisos
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener todos los cupones ordenados por fecha de creación descendente
    const coupons = await prisma.discountCoupon.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(coupons)
  } catch (error) {
    log.error('Error en GET /api/cupones:', error)
    return NextResponse.json(
      { error: 'Error al obtener cupones' },
      { status: 500 }
    )
  }
}

// POST /api/cupones - Crear un nuevo cupón
export async function POST(req: Request) {
  try {
    // Verificar autenticación y permisos
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json()
    
    // Validar datos requeridos
    if (!data.code || !data.discountType || data.discountValue === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar tipo de descuento
    if (!['PERCENTAGE', 'FIXED_AMOUNT'].includes(data.discountType)) {
      return NextResponse.json(
        { error: 'Tipo de descuento inválido' },
        { status: 400 }
      )
    }

    // Validar valor del descuento
    if (data.discountType === 'PERCENTAGE' && (data.discountValue <= 0 || data.discountValue > 100)) {
      return NextResponse.json(
        { error: 'El porcentaje de descuento debe estar entre 1 y 100' },
        { status: 400 }
      )
    }

    if (data.discountValue <= 0) {
      return NextResponse.json(
        { error: 'El valor del descuento debe ser mayor que 0' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un cupón con el mismo código (búsqueda insensible a mayúsculas/minúsculas)
    const existingCoupon = await prisma.discountCoupon.findFirst({
      where: {
        code: {
          equals: data.code,
          mode: 'insensitive'
        }
      }
    })

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Ya existe un cupón con este código' },
        { status: 400 }
      )
    }

    // Crear el cupón (normalizando el código a mayúsculas)
    const coupon = await prisma.discountCoupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue || 0,
        maxUses: data.maxUses || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    log.error('Error en POST /api/cupones:', error)
    return NextResponse.json(
      { error: 'Error al crear el cupón' },
      { status: 500 }
    )
  }
}