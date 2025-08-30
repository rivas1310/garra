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

    // SOLO procesar checkout.session.completed - ignorar otros eventos
    if (event.type === 'checkout.session.completed') {
      log.error('🎯 PROCESANDO SOLO checkout.session.completed - IGNORANDO OTROS EVENTOS')
      const session = event.data.object as Stripe.Checkout.Session

      log.error('📋 Procesando sesión completada:', session.id)
      log.error('📋 Metadata:', session.metadata)

      // Crear o actualizar la orden con los datos del formulario
      try {
        // Buscar si ya existe una orden con este session ID
        log.error(`🔍 Buscando orden existente con session ID: ${session.id}`)
        
        const existingOrder = await prisma.order.findFirst({
          where: {
            stripeSessionId: session.id
          }
        })

        // Verificar si hay un código de cupón en los metadatos
        const couponCode = session.metadata?.couponCode

        log.error(`🔍 Resultado de búsqueda: ${existingOrder ? 'ENCONTRADA' : 'NO ENCONTRADA'}`)
        if (existingOrder) {
          log.error(`🔍 Orden encontrada - ID: ${existingOrder.id}, Status: ${existingOrder.status}`)
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
                  log.error(`⚠️ Producto ${item.product.name} desactivado - sin stock disponible en variantes`)
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
          log.error('🆕 No se encontró orden existente - creando nueva orden para la sesión:', session.id)
          
          // Validaciones antes de crear la orden
          const customerEmail = session.metadata?.email || session.customer_email
          if (!customerEmail) {
            log.error('Error: No se encontró email del cliente en la sesión de Stripe')
            return NextResponse.json({ error: 'Email del cliente requerido' }, { status: 400 })
          }

          if (!session.metadata?.items) {
            log.error('Error: No se encontraron items en los metadata de la sesión')
            return NextResponse.json({ error: 'Items de la orden requeridos' }, { status: 400 })
          }
          
          // Buscar o crear usuario
          let user = await prisma.user.findUnique({
            where: { email: customerEmail }
          })

          if (!user) {
            // Crear usuario temporal para el pedido
            const bcrypt = require('bcryptjs')
            user = await prisma.user.create({
              data: {
                email: customerEmail,
                name: session.metadata?.nombre || 'Usuario Temporal',
                role: 'USER',
                hashedPassword: await bcrypt.hash(Math.random().toString(36).slice(-8), 10)
              }
            })
            log.error('👤 Usuario creado:', user.email)
          }

          // Parsear los items desde metadata
          const items = JSON.parse(session.metadata?.items || '[]')
          
          console.log(`Creando orden desde webhook para session: ${session.id}, usuario: ${user.email}`)
          
          // Crear la nueva orden
          const newOrder = await prisma.order.create({
            data: {
              userId: user.id,
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              total: parseFloat(session.metadata?.total || '0'),
              subtotal: parseFloat(session.metadata?.subtotal || '0'),
              tax: parseFloat(session.metadata?.tax || '0'),
              shipping: parseFloat(session.metadata?.shipping || '0'),
              discount: parseFloat(session.metadata?.discount || '0'),
              couponCode: session.metadata?.couponCode || null,
              couponDiscount: parseFloat(session.metadata?.couponDiscount || '0'),
              stripeSessionId: session.id,
              paymentMethod: session.id, // Asegurar que paymentMethod también tenga el session ID
              notes: `Cliente: ${session.metadata?.nombre} - Email: ${session.metadata?.email}`,
              // Datos del cliente
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
              stripeMetadata: session.metadata || {},
              // Crear los OrderItems
              items: {
                create: items.map((item: any) => ({
                  productId: item.productId,
                  variantId: item.variantId || null,
                  quantity: item.quantity,
                  price: item.price
                }))
              }
            },
            include: {
              items: {
                include: {
                  product: true,
                  variant: true
                }
              }
            }
          })
          
          log.error('✅ Nueva orden creada:', newOrder.id)
          
          // Incrementar el contador de usos del cupón SOLO para nuevas órdenes
          if (couponCode) {
            log.error(`Procesando uso de cupón para nueva orden: ${couponCode}`)

            await prisma.discountCoupon.updateMany({
              where: { code: couponCode },
              data: { usedCount: { increment: 1 } }
            })

            log.error(`Contador de usos incrementado para el cupón: ${couponCode}`)
          }
          
          // Descontar el stock de cada item de la orden
          for (const item of newOrder.items) {
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
                  log.error(`⚠️ Producto ${item.product.name} desactivado - sin stock disponible en variantes`)
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
          
          log.error('✅ Nueva orden confirmada - stock descontado correctamente')
        }
      } catch (error) {
        log.error('❌ Error al actualizar orden con datos del formulario:', error)
      }
    } else {
      log.error(`🚫 IGNORANDO evento: ${event.type} - Solo procesamos checkout.session.completed`)
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