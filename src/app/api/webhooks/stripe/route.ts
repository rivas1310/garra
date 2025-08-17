import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// Esta función es necesaria para procesar el cuerpo de la solicitud como un stream
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })

  // Obtener la firma de Stripe
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma de Stripe' }, { status: 400 })
  }

  try {
    // Obtener el cuerpo de la solicitud como texto
    const reqBody = await req.text()

    // Verificar el evento con la firma
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      log.error('STRIPE_WEBHOOK_SECRET no está configurado')
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
    }

    const event = stripe.webhooks.constructEvent(
      reqBody,
      signature,
      webhookSecret
    )

    // Manejar diferentes tipos de eventos
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      log.error('📋 Procesando sesión completada:', session.id)
      log.error('📋 Metadata:', session.metadata)

      // Verificar si hay un código de cupón en los metadatos
      const couponCode = session.metadata?.couponCode

      if (couponCode) {
        log.error(`Procesando uso de cupón: ${couponCode}`)

        // Incrementar el contador de usos del cupón
        await prisma.discountCoupon.updateMany({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } }
        })

        log.error(`Contador de usos incrementado para el cupón: ${couponCode}`)
      }

      // Crear o actualizar la orden con los datos del formulario
      try {
        // Buscar si ya existe una orden con este session ID
        const existingOrder = await prisma.order.findFirst({
          where: {
            stripeSessionId: session.id
          }
        })

        if (existingOrder) {
          // Actualizar la orden existente con los datos del formulario
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              // Datos del formulario de checkout
              customerName: session.metadata?.nombre || null,
              customerEmail: session.metadata?.email || session.customer_email || null,
              customerPhone: session.metadata?.telefono || null,
              customerStreet: session.metadata?.direccion || null,
              customerNumberExterior: session.metadata?.numeroExterior || null,
              customerNumberInterior: session.metadata?.numeroInterior || null,
              customerColonia: session.metadata?.colonia || null,
              customerCity: session.metadata?.ciudad || null,
              customerState: session.metadata?.estado || null,
              customerPostalCode: session.metadata?.codigoPostal || null,
              customerCountry: session.metadata?.pais || null,
              customerReferences: session.metadata?.referencias || null,
              
              // Metadata completa como JSON
              stripeMetadata: session.metadata || {},
              
              // Actualizar estado de pago
              paymentStatus: 'PAID',
              status: 'CONFIRMED'
            }
          })
          
          log.error('✅ Orden actualizada con datos del formulario:', existingOrder.id)
          
          // Obtener los items de la orden para descontar el stock
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: existingOrder.id },
            include: {
              product: true,
              variant: true
            }
          })
          
          log.error(`📋 Items en la orden: ${orderItems.length}`)
          
          // Descontar el stock de cada item de la orden
          for (const item of orderItems) {
            log.error(`📦 Descontando stock para: ${item.product.name} - Cantidad: ${item.quantity}`)
            
            try {
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
                
                await prisma.product.update({
                  where: { id: item.productId },
                  data: { 
                    stock: totalStock,
                    isActive: totalStock > 0
                  }
                })
                
                log.error(`✅ Stock total del producto actualizado: ${item.product.name}, nuevo stock total: ${totalStock}`)
                
                if (totalStock <= 0) {
                  log.error(`⚠️ Producto ${item.product.name} desactivado - sin stock disponible`)
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
                  log.error(`⚠️ Producto ${item.product.name} desactivado - sin stock disponible`)
                }
              }
              
              log.error(`✅ Item procesado: ${item.product.name} - Cantidad: ${item.quantity}`)
            } catch (error) {
              log.error(`❌ Error al descontar stock para ${item.product.name}:`, error)
            }
          }
          
          log.error('✅ Orden confirmada - stock descontado correctamente')
          
        } else {
          log.error('⚠️ No se encontró orden existente para la sesión:', session.id)
        }
      } catch (error) {
        log.error('❌ Error al actualizar orden con datos del formulario:', error)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    log.error('Error en el webhook de Stripe:', error)
    return NextResponse.json(
      { error: 'Error al procesar el webhook' },
      { status: 400 }
    )
  }
}