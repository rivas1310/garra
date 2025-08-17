import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Buscar o crear usuario invitado para órdenes sin usuario autenticado
      let guestUser = await prisma.user.findFirst({
        where: { email: 'guest@bazar.com' }
      })

      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: 'guest@bazar.com',
            name: 'Usuario Invitado',
            role: 'USER',
            hashedPassword: 'guest_password_hash' // Contraseña dummy para usuario invitado
          }
        })
      }

      // Guardar el pedido en la base de datos
      await prisma.order.create({
        data: {
          userId: guestUser.id,
          status: 'CONFIRMED',
          total: session.amount_total! / 100,
          subtotal: session.amount_subtotal! / 100,
          tax: 0,
          shipping: 0,
          paymentMethod: session.id,
          paymentStatus: 'PAID',
          notes: `Compra realizada como invitado. Session ID: ${session.id}`,
          items: {
            create: [],
          },
        },
      })

      log.error('Pedido creado exitosamente desde webhook:', session.id)
    } catch (error) {
      log.error('Error al procesar webhook:', error)
      return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
} 