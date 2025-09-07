import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/lib/prisma'
import { updateProductStock } from '@/lib/productUtils'

export async function POST(req: Request) {
  try {
    // Verificar autenticación (solo administradores pueden registrar ventas físicas)
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    // Verificar si el usuario es administrador o vendedor
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'VENDEDOR' as any)) {
      return NextResponse.json({ error: 'Acceso denegado. Se requiere rol de Administrador o Vendedor' }, { status: 403 })
    }
    
    // Obtener datos de la venta física
    const data = await req.json()
    log.error('Datos recibidos para venta física:', data)
    
    const { items, total, subtotal, tax = 0, orderType = 'FISICA', paymentMethod = 'efectivo' } = data
    
    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No hay productos en la venta' }, { status: 400 })
    }
    
    // Verificar stock de productos y variantes
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { 
          id: true, 
          name: true, 
          stock: true,
          variants: {
            select: {
              id: true,
              color: true,
              size: true,
              stock: true
            }
          }
        }
      })
      
      if (!product) {
        return NextResponse.json({ 
          error: `Producto no encontrado: ${item.productId}` 
        }, { status: 404 })
      }
      
      // Si hay variante seleccionada, verificar stock de la variante
      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId)
        if (!variant) {
          return NextResponse.json({ 
            error: `Variante no encontrada para ${product.name}` 
          }, { status: 404 })
        }
        
        if (variant.stock < item.quantity) {
          return NextResponse.json({ 
            error: `Stock insuficiente para ${product.name} (${variant.color} - ${variant.size}). Disponible: ${variant.stock}` 
          }, { status: 400 })
        }
      } else {
        // Si no hay variante, verificar stock del producto principal
        if (product.stock < item.quantity) {
          return NextResponse.json({ 
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` 
          }, { status: 400 })
        }
      }
    }
    
    // Crear la orden (venta física)
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'DELIVERED', // Las ventas físicas se consideran entregadas inmediatamente
        total,
        subtotal,
        tax,
        shipping: 0, // No hay envío en ventas físicas
        discount: 0,
        paymentStatus: 'PAID', // Se asume que el pago ya se realizó
        paymentMethod: paymentMethod === 'efectivo' ? 'EFECTIVO' : 'TARJETA',
        orderType: 'FISICA', // Marcar como venta física
        notes: `Venta física registrada por ${session.user.email} - Método: ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}`,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            variantId: item.variantId || null
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true
              }
            }
          }
        }
      }
    })
    
    // Actualizar stock de productos y variantes
    for (const item of items) {
      if (item.variantId) {
        // Actualizar stock de la variante
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true }
        })
        
        if (variant) {
          const newVariantStock = Math.max(0, variant.stock - item.quantity)
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: newVariantStock }
          })
        }
      } else {
        // Actualizar stock del producto principal
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true }
        })
        
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity)
          await updateProductStock(item.productId, newStock)
        }
      }
    }
    
    log.error('Venta física registrada exitosamente:', order.id)
    return NextResponse.json({ 
      success: true, 
      message: 'Venta física registrada correctamente',
      id: order.id,
      total: order.total,
      items: order.items,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt
    })
    
  } catch (error) {
    log.error('Error al registrar venta física:', error)
    return NextResponse.json({ 
      error: 'Error al registrar venta física', 
      detalle: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Verificar autenticación (solo administradores pueden ver ventas físicas)
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    // Verificar si el usuario es administrador o vendedor
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'VENDEDOR' as any)) {
      return NextResponse.json({ error: 'Acceso denegado. Se requiere rol de Administrador o Vendedor' }, { status: 403 })
    }
    
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const dateFilter = searchParams.get('date')
    
    // Construir condiciones de búsqueda
    const whereCondition: any = {
      orderType: 'FISICA'
    }
    
    // Aplicar filtro de fecha si existe
    if (dateFilter) {
      const startDate = new Date(dateFilter)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(dateFilter)
      endDate.setHours(23, 59, 59, 999)
      
      whereCondition.createdAt = {
        gte: startDate,
        lte: endDate
      }
    }
    
    // Obtener ventas físicas con filtros aplicados
    const ventasFisicas = await prisma.order.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(ventasFisicas)
    
  } catch (error) {
    log.error('Error al obtener ventas físicas:', error)
    return NextResponse.json({ 
      error: 'Error al obtener ventas físicas', 
      detalle: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}