import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma'

// POST /api/cupones/validar - Validar y aplicar un cupón
export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json()

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Código de cupón requerido' },
        { status: 400 }
      )
    }

    if (subtotal === undefined || subtotal <= 0) {
      return NextResponse.json(
        { success: false, message: 'Total del carrito inválido' },
        { status: 400 }
      )
    }

    // Buscar el cupón por código (búsqueda insensible a mayúsculas/minúsculas)
    const coupon = await prisma.discountCoupon.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive'
        }
      }
    })

    // Verificar si el cupón existe
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Cupón no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el cupón está activo
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, message: 'Este cupón no está activo' },
        { status: 400 }
      )
    }

    // Verificar fecha de inicio
    if (coupon.startDate && new Date() < coupon.startDate) {
      return NextResponse.json(
        { success: false, message: 'Este cupón aún no está disponible' },
        { status: 400 }
      )
    }

    // Verificar fecha de expiración
    if (coupon.endDate && new Date() > coupon.endDate) {
      return NextResponse.json(
        { success: false, message: 'Este cupón ha expirado' },
        { status: 400 }
      )
    }

    // Verificar número máximo de usos
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { success: false, message: 'Este cupón ya ha alcanzado su límite de usos' },
        { status: 400 }
      )
    }

    // Verificar valor mínimo de pedido
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return NextResponse.json({
        success: false,
        message: `Este cupón requiere un mínimo de compra de $${coupon.minOrderValue.toFixed(2)}`,
      }, { status: 400 })
    }

    // Calcular el descuento
    let discountAmount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100
    } else {
      // Para descuentos de monto fijo, el descuento no puede ser mayor que el total
      discountAmount = Math.min(coupon.discountValue, subtotal)
    }

    // Redondear el descuento a 2 decimales
    discountAmount = Math.round(discountAmount * 100) / 100

    // Devolver información del cupón y el descuento
    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount,
        minOrderValue: coupon.minOrderValue
      },
      message: 'Cupón aplicado correctamente',
    })
  } catch (error) {
    log.error('Error en POST /api/cupones/validar:', error)
    return NextResponse.json(
      { success: false, message: 'Error al validar el cupón' },
      { status: 500 }
    )
  }
}