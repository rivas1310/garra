import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('🧪 Body recibido:', body)
    
    const { sessionId } = body
    
    if (!sessionId) {
      console.log('❌ Session ID no encontrado en body:', body)
      return NextResponse.json({ error: 'Session ID requerido' }, { status: 400 })
    }
    
    console.log('🧪 Procesando webhook de prueba para session:', sessionId)
    
    // Buscar la orden con este session ID
    const existingOrder = await prisma.order.findFirst({
      where: {
        stripeSessionId: sessionId
      }
    })
    
    if (!existingOrder) {
      console.log('❌ No se encontró orden con session ID:', sessionId)
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }
    
    console.log('✅ Orden encontrada:', existingOrder.id)
    
    // Actualizar la orden
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED'
      }
    })
    
    console.log('✅ Orden actualizada a PAID/CONFIRMED')
    
    // El stock ya está reservado desde el carrito, no es necesario descontarlo nuevamente
    console.log('📦 Stock ya reservado desde el carrito - no es necesario descontar nuevamente')
    
    // Obtener los items de la orden para logging
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: existingOrder.id },
      include: {
        product: true,
        variant: true
      }
    })
    
    console.log(`📋 Items en la orden: ${orderItems.length}`)
    
    // Solo mostrar información de los items, sin descontar stock
    for (const item of orderItems) {
      console.log(`📦 Item confirmado: ${item.product.name} - Cantidad: ${item.quantity}`)
    }
    
    console.log('✅ Orden confirmada - stock ya estaba reservado desde el carrito')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook procesado correctamente',
      orderId: existingOrder.id,
      itemsProcessed: orderItems.length
    })
    
  } catch (error) {
    console.error('❌ Error en webhook de prueba:', error)
    return NextResponse.json({ 
      error: 'Error al procesar webhook', 
      detalle: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
} 