import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendOrderConfirmationEmail, type OrderData } from '@/lib/email'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerStreet: true,
        customerNumberExterior: true,
        customerNumberInterior: true,
        customerColonia: true,
        customerCity: true,
        customerState: true,
        customerPostalCode: true,
        customerReferences: true,
        shippingLabelUrl: true,
        trackingNumber: true,
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
    log.error('Datos recibidos para crear pedido:', data)
    
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
        // Guardar datos del cliente para la etiqueta de envío
        customerName: customer.nombre || null,
        customerEmail: customer.email || null,
        customerPhone: customer.telefono || null,
        customerStreet: customer.direccion || null,
        customerNumberExterior: customer.numeroExterior || null,
        customerNumberInterior: customer.numeroInterior || null,
        customerColonia: customer.colonia || null,
        customerCity: customer.ciudad || null,
        customerState: customer.estado || null,
        customerPostalCode: customer.codigoPostal || null,
        customerCountry: customer.pais || null,
        customerReferences: customer.referencias || null,
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

    log.error('Pedido creado exitosamente:', order.id)
    
    // Enviar correo de confirmación
    try {
      const orderData: OrderData = {
        orderId: order.id,
        customerName: customer.nombre,
        customerEmail: customer.email,
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size || undefined,
          color: item.color || undefined,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount || 0,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        couponCode: coupon?.code || undefined,
        shippingAddress: {
          direccion: customer.direccion,
          numeroExterior: customer.numeroExterior,
          numeroInterior: customer.numeroInterior || undefined,
          colonia: customer.colonia,
          ciudad: customer.ciudad,
          estado: customer.estado,
          codigoPostal: customer.codigoPostal,
          pais: customer.pais,
          referencias: customer.referencias || undefined,
        }
      }
      
      const emailSent = await sendOrderConfirmationEmail(orderData)
      if (emailSent) {
        log.error('✅ Correo de confirmación enviado exitosamente')
      } else {
        log.error('⚠️ No se pudo enviar el correo de confirmación')
      }
    } catch (emailError) {
      log.error('❌ Error al enviar correo de confirmación:', emailError)
      // No fallar la creación del pedido por error de email
    }
    
    return NextResponse.json({ success: true, order })

  } catch (error) {
    log.error('Error al crear pedido:', error)
    return NextResponse.json({ 
      error: 'Error al crear pedido', 
      detalle: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}