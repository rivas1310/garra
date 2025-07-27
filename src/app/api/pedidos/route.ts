import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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
            },
            variant: {
              select: {
                size: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pedidos', detalle: String(error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log('Datos recibidos para crear pedido:', data)
    
    const {
      stripeSessionId,
      items,
      customer,
      totals,
      coupon
    } = data

    // Validaciones
    if (!stripeSessionId || !items || !customer || !totals) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Verificar si ya existe un pedido con este Stripe Session ID
    const existingOrder = await prisma.order.findFirst({
      where: { paymentMethod: stripeSessionId }
    })

    if (existingOrder) {
      return NextResponse.json({ error: 'Pedido ya existe', order: existingOrder }, { status: 409 })
    }

    // Buscar o crear usuario
    let user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!user) {
      // Crear usuario temporal para el pedido
      user = await prisma.user.create({
        data: {
          email: customer.email,
          name: customer.nombre,
          role: 'USER',
          hashedPassword: await bcrypt.hash(Math.random().toString(36).slice(-8), 10)
        }
      })
    }

    // Crear el pedido
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'CONFIRMED',
        total: totals.total,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        discount: totals.discount || 0,
        couponCode: coupon?.code || null,
        couponDiscount: coupon?.discountAmount || 0,
        paymentMethod: stripeSessionId, // Usar el session ID como referencia
        paymentStatus: 'PAID',
        notes: `Compra realizada por ${customer.nombre}. Dirección: ${customer.direccion}, ${customer.ciudad}, ${customer.estado}, ${customer.codigoPostal}, ${customer.pais}. Teléfono: ${customer.telefono}`,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || 'unknown',
            quantity: item.quantity,
            price: item.price,
            variantId: item.variantId || null,
          }))
        }
      },
      include: {
        items: true,
        user: true
      }
    })

    console.log('Pedido creado exitosamente:', order.id)
    return NextResponse.json({ success: true, order })

  } catch (error) {
    console.error('Error al crear pedido:', error)
    return NextResponse.json({ 
      error: 'Error al crear pedido', 
      detalle: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}