import { NextResponse } from 'next/server'
import stripe from '@/utils/stripe'

export async function POST(req: Request) {
  try {
    console.log('Iniciando creación de sesión de Stripe...')
    
    const { items, customer } = await req.json()
    console.log('Datos recibidos:', { items, customer })

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No se enviaron productos válidos' }, { status: 400 })
    }

    if (!customer || !customer.email || !customer.nombre) {
      return NextResponse.json({ error: 'Faltan datos del cliente' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY no está configurada')
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error('NEXTAUTH_URL no está configurada')
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

    console.log('Line items para Stripe:', line_items)

    console.log('Creando sesión de Stripe...')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=1`,
      customer_email: customer?.email,
      metadata: {
        nombre: customer?.nombre || '',
        telefono: customer?.telefono || '',
        direccion: customer?.direccion || '',
        ciudad: customer?.ciudad || '',
        estado: customer?.estado || '',
        codigoPostal: customer?.codigoPostal || '',
        pais: customer?.pais || '',
      },
    })
    
    console.log('Sesión de Stripe creada:', { id: session.id, url: session.url })
    
    if (!session.url) {
      throw new Error('Stripe no devolvió una URL de sesión')
    }
    
    // Almacenar la información del pedido en metadata para webhook
    // o devolver el session ID para crear el pedido manualmente
    return NextResponse.json({ 
      url: session.url, 
      sessionId: session.id,
      // Información para crear el pedido después
      orderData: {
        items: items.map((item, index) => ({
          productId: `product_${index}`, // Esto debería venir del carrito real
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customer,
        totals: {
          subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          tax: 0, // Se calculará en el frontend
          shipping: 0, // Se calculará en el frontend
          total: 0 // Se calculará en el frontend
        }
      }
    })
  } catch (error) {
    console.error('Error en /api/checkout:', error)
    return NextResponse.json({ error: 'Error al crear la sesión de pago', detalle: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
} 