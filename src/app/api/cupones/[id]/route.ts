import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/lib/prisma'

// GET /api/cupones/[id] - Obtener un cupón específico
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    // Verificar autenticación y permisos
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = params

    // Obtener el cupón
    const coupon = await prisma.discountCoupon.findUnique({
      where: { id }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    // Obtener el ID de manera segura para el log de error
    const id = 'desconocido' // No podemos acceder a params.id directamente
    log.error(`Error en GET /api/cupones/${id}:`, error)
    return NextResponse.json(
      { error: 'Error al obtener el cupón' },
      { status: 500 }
    )
  }
}

// PUT /api/cupones/[id] - Actualizar un cupón
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    // Verificar autenticación y permisos
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = params
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

    // Verificar si el cupón existe
    const existingCoupon = await prisma.discountCoupon.findUnique({
      where: { id }
    })

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    // Verificar si ya existe otro cupón con el mismo código
    if (data.code !== existingCoupon.code) {
      const duplicateCoupon = await prisma.discountCoupon.findUnique({
        where: { code: data.code }
      })

      if (duplicateCoupon) {
        return NextResponse.json(
          { error: 'Ya existe un cupón con este código' },
          { status: 400 }
        )
      }
    }

    // Actualizar el cupón
    const updatedCoupon = await prisma.discountCoupon.update({
      where: { id },
      data: {
        code: data.code,
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue || 0,
        maxUses: data.maxUses || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate ? new Date(data.startDate) : existingCoupon.startDate,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    })

    return NextResponse.json(updatedCoupon)
  } catch (error) {
    // Obtener el ID de manera segura para el log de error
    const id = 'desconocido' // No podemos acceder a params.id directamente
    log.error(`Error en PUT /api/cupones/${id}:`, error)
    return NextResponse.json(
      { error: 'Error al actualizar el cupón' },
      { status: 500 }
    )
  }
}

// DELETE /api/cupones/[id] - Eliminar un cupón
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    // Verificar autenticación y permisos
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = params

    // Verificar si el cupón existe
    const existingCoupon = await prisma.discountCoupon.findUnique({
      where: { id }
    })

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    // Eliminar el cupón
    await prisma.discountCoupon.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Cupón eliminado correctamente' })
  } catch (error) {
    // Obtener el ID de manera segura para el log de error
    const id = 'desconocido' // No podemos acceder a params.id directamente
    log.error(`Error en DELETE /api/cupones/${id}:`, error)
    return NextResponse.json(
      { error: 'Error al eliminar el cupón' },
      { status: 500 }
    )
  }
}