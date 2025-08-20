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

    // Validaciones de entrada
    if (!stripeSessionId) {
      return NextResponse.json(
        { error: 'stripeSessionId es requerido' },
        { status: 400 }
      )
    }

    if (!customer || !customer.email) {
      return NextResponse.json(
        { error: 'Información del cliente es requerida' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items de la orden son requeridos' },
        { status: 400 }
      )
    }

    if (!totals) {
      return NextResponse.json(
        { error: 'Totales de la orden son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un pedido con este Stripe Session ID
    const existingOrder = await prisma.order.findFirst({
      where: { paymentMethod: stripeSessionId }
    })

    if (existingOrder) {
      console.log(`Orden duplicada detectada para session: ${stripeSessionId}, orden existente: ${existingOrder.id}`)
      return NextResponse.json(
        { 
          error: 'Orden ya existe',
          order: existingOrder
        },
        { status: 409 }
      )
    }

    // Log para debugging
    console.log(`Creando nueva orden para session: ${stripeSessionId}`)

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
    
    // IMPORTANTE: Descontar stock de los productos/variantes
    log.error('🔄 Descontando stock de los productos...')
    
    for (const item of order.items) {
      try {
        log.error(`📦 Descontando stock para producto ID: ${item.productId} - Cantidad: ${item.quantity}`)
        
        if (item.variantId) {
          // Si tiene variante, descontar del stock de la variante
          const updatedVariant = await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
          log.error(`✅ Stock de variante descontado: ${item.variantId}, nuevo stock: ${updatedVariant.stock}`)
          
          // Actualizar el stock total del producto principal
          const allVariants = await prisma.productVariant.findMany({
            where: { productId: item.productId }
          })
          
          const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0)
          
          // Actualizar el stock principal del producto
          await prisma.product.update({
            where: { id: item.productId },
            data: { 
              stock: totalStock,
              isActive: totalStock > 0
            }
          })
          
          log.error(`✅ Stock principal actualizado: ${item.productId}, nuevo stock total: ${totalStock}`)
          
          if (totalStock <= 0) {
            log.error(`⚠️ Producto desactivado - sin stock disponible en variantes`)
          }
        } else {
          // Si no tiene variante, descontar del stock principal del producto
          const updatedProduct = await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
          log.error(`✅ Stock de producto descontado: ${item.productId}, nuevo stock: ${updatedProduct.stock}`)
          
          // Si el stock llega a 0, desactivar el producto
          if (updatedProduct.stock <= 0) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { isActive: false }
            })
            log.error(`⚠️ Producto desactivado - sin stock disponible`)
          }
        }
        
        log.error(`✅ Item procesado: ${item.productId} - Cantidad: ${item.quantity}`)
      } catch (stockError) {
        log.error(`❌ Error al descontar stock para producto ${item.productId}:`, stockError)
        // No fallar la creación del pedido por error de stock
      }
    }
    
    log.error('✅ Stock descontado correctamente para todos los items')
    
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