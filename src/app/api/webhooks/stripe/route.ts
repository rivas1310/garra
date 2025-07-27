import { NextResponse } from 'next/server'
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
      console.error('STRIPE_WEBHOOK_SECRET no está configurado')
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

      // Verificar si hay un código de cupón en los metadatos
      const couponCode = session.metadata?.couponCode

      if (couponCode) {
        console.log(`Procesando uso de cupón: ${couponCode}`)

        // Incrementar el contador de usos del cupón
        await prisma.discountCoupon.updateMany({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } }
        })

        console.log(`Contador de usos incrementado para el cupón: ${couponCode}`)
      }

      // Aquí también se puede crear la orden en la base de datos
      // o actualizar el estado de una orden existente
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error en el webhook de Stripe:', error)
    return NextResponse.json(
      { error: 'Error al procesar el webhook' },
      { status: 400 }
    )
  }
}