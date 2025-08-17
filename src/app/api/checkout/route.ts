import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import stripe from '@/utils/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    log.error('Iniciando creación de sesión de Stripe...')
    
    const { items, customer, coupon } = await req.json()
    log.error('📋 DATOS RECIBIDOS DEL FORMULARIO:')
    log.error('📦 Items:', JSON.stringify(items, null, 2))
    log.error('👤 Customer:', JSON.stringify(customer, null, 2))
    log.error('🎫 Coupon:', JSON.stringify(coupon, null, 2))
    
    // Verificar específicamente los campos problemáticos
    log.error('🔍 VERIFICACIÓN DE CAMPOS PROBLEMÁTICOS:')
    log.error('   📍 Colonia:', customer?.colonia)
    log.error('   📮 CP:', customer?.codigoPostal)
    log.error('   📝 Referencias:', customer?.referencias)
    log.error('   📍 Calle:', customer?.direccion)
    log.error('   📍 Número exterior:', customer?.numeroExterior)
    log.error('   📍 Número interior:', customer?.numeroInterior)
    
    // Verificar que todos los campos estén presentes
    log.error('🔍 VERIFICACIÓN COMPLETA DE CAMPOS:')
    log.error('   👤 nombre:', customer?.nombre)
    log.error('   📧 email:', customer?.email)
    log.error('   📞 telefono:', customer?.telefono)
    log.error('   📍 direccion:', customer?.direccion)
    log.error('   📍 numeroExterior:', customer?.numeroExterior)
    log.error('   📍 numeroInterior:', customer?.numeroInterior)
    log.error('   🏘️ colonia:', customer?.colonia)
    log.error('   🏙️ ciudad:', customer?.ciudad)
    log.error('   🏛️ estado:', customer?.estado)
    log.error('   📮 codigoPostal:', customer?.codigoPostal)
    log.error('   🌍 pais:', customer?.pais)
    log.error('   📝 referencias:', customer?.referencias)

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No se enviaron productos válidos' }, { status: 400 })
    }

    if (!customer || !customer.email || !customer.nombre) {
      return NextResponse.json({ error: 'Faltan datos del cliente' }, { status: 400 })
    }
    
    // Calcular subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    if (!process.env.STRIPE_SECRET_KEY) {
      log.error('STRIPE_SECRET_KEY no está configurada')
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
    }

    if (!process.env.NEXTAUTH_URL) {
      log.error('NEXTAUTH_URL no está configurada')
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
    }

    // items: [{ name, price, quantity }]
    const line_items = items.map((item: any) => {
      if (!item.name || !item.price || !item.quantity) {
        throw new Error(`Producto inválido: ${JSON.stringify(item)}`)
      }
      
      return {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Stripe requiere centavos
        },
        quantity: item.quantity,
      }
    })

    log.error('Line items para Stripe:', line_items)
    
    // Calcular descuento si hay cupón
    let discountAmount = 0
    if (coupon) {
      discountAmount = coupon.discountAmount
    }
    
    // Calcular impuestos y envío
    const tax = (subtotal - discountAmount) * 0.16 // 16% IVA
    const shipping = subtotal >= 1500 ? 0 : 200 // Envío gratis para compras de $1500 o más, $200 para menores
    const total = subtotal + shipping + tax - discountAmount
    
    // Crear objeto de descuento para Stripe si hay cupón
    const discounts = coupon ? [
      {
        coupon_id: coupon.id,
        // Crear un objeto de descuento personalizado
        discount: {
          type: coupon.discountType === 'PERCENTAGE' ? 'percent' : 'fixed_amount',
          amount: coupon.discountType === 'PERCENTAGE' ? coupon.discountValue : Math.round(coupon.discountValue * 100),
          currency: 'mxn',
          name: `Cupón ${coupon.code}`,
        }
      }
    ] : []

    log.error('Creando sesión de Stripe...')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=1`,
      customer_email: customer?.email,
      metadata: {
        nombre: customer?.nombre || '',
        email: customer?.email || '', // Agregar email a los metadatos
        telefono: customer?.telefono || '',
        direccion: customer?.direccion || '',
        numeroExterior: customer?.numeroExterior || '',
        numeroInterior: customer?.numeroInterior || '',
        colonia: customer?.colonia || '',
        ciudad: customer?.ciudad || '',
        estado: customer?.estado || '',
        codigoPostal: customer?.codigoPostal || '',
        pais: customer?.pais || '',
        referencias: customer?.referencias || '',
        couponCode: coupon?.code || '',
        couponDiscount: coupon ? String(coupon.discountAmount) : '0',
      },
    })
    
    log.error('Sesión de Stripe creada:', { id: session.id, url: session.url })
    
    if (!session.url) {
      throw new Error('Stripe no devolvió una URL de sesión')
    }

    // Crear la orden en la base de datos con el session ID
    try {
      // Obtener el primer usuario disponible (para pruebas)
      const user = await prisma.user.findFirst();
      if (!user) {
        throw new Error('No hay usuarios en la base de datos');
      }
      
      // Crear la orden en la base de datos
      
      const order = await prisma.order.create({
        data: {
          userId: user.id, // Usar el ID del usuario real
          total: total,
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          discount: discountAmount,
          couponCode: coupon?.code || null,
          couponDiscount: discountAmount,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          notes: `Cliente: ${customer.nombre} - Email: ${customer.email}`,
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
          // Crear los OrderItems
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      })

      log.error('✅ Orden creada en la base de datos:', order.id)
      
      // Descontar stock de los productos
      log.error('📦 Descontando stock de los productos...')
      for (const item of items) {
        log.error(`📦 Descontando stock para: ${item.name} - Cantidad: ${item.quantity}`)
        
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
            });
            log.error(`✅ Stock de variante descontado: ${item.variantId}, nuevo stock: ${updatedVariant.stock}`);
            
            // Actualizar el stock total del producto principal
            const allVariants = await prisma.productVariant.findMany({
              where: { productId: item.productId }
            });
            
            const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
            
            await prisma.product.update({
              where: { id: item.productId },
              data: { 
                stock: totalStock,
                isActive: totalStock > 0
              }
            });
            
            log.error(`✅ Stock total del producto actualizado: ${item.name}, nuevo stock total: ${totalStock}`);
            
            if (totalStock <= 0) {
              log.error(`⚠️ Producto ${item.name} desactivado - sin stock disponible`);
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
            });
            log.error(`✅ Stock de producto descontado: ${item.productId}, nuevo stock: ${updatedProduct.stock}`);
            
            // Si el stock llega a 0, desactivar el producto
            if (updatedProduct.stock <= 0) {
              await prisma.product.update({
                where: { id: item.productId },
                data: { isActive: false }
              });
              log.error(`⚠️ Producto ${item.name} desactivado - sin stock disponible`);
            }
          }
          
          log.error(`✅ Item procesado: ${item.name} - Cantidad: ${item.quantity}`);
        } catch (error) {
          log.error(`❌ Error al descontar stock para ${item.name}:`, error);
        }
      }
      
      log.error('✅ Stock descontado correctamente');
      log.error('📋 Orden creada exitosamente:', order.id);
    } catch (error) {
      log.error('❌ Error al crear la orden:', error)
      // Continuar aunque falle la creación de la orden
    }
    
    return NextResponse.json({ 
      url: session.url, 
      sessionId: session.id
    })
  } catch (error) {
    log.error('Error en /api/checkout:', error)
    return NextResponse.json({ error: 'Error al crear la sesión de pago', detalle: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}