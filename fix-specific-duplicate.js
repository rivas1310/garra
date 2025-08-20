const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixSpecificDuplicate() {
  try {
    console.log('🔧 Corrigiendo el duplicado específico identificado...')
    
    const sessionId = 'cs_test_a16n5t65fEKELYeJciIgaPMWvFKOnPHpY27Jn5GsKFwutEkj9UJuFDUvTo'
    
    // Buscar las dos órdenes problemáticas
    const orderWithStripeSessionId = await prisma.order.findFirst({
      where: {
        stripeSessionId: sessionId
      },
      include: {
        items: true
      }
    })
    
    const orderWithPaymentMethod = await prisma.order.findFirst({
      where: {
        paymentMethod: sessionId,
        stripeSessionId: null
      },
      include: {
        items: true
      }
    })
    
    console.log('📋 Órdenes encontradas:')
    if (orderWithStripeSessionId) {
      console.log(`   Orden con stripeSessionId: ${orderWithStripeSessionId.id} (creada: ${orderWithStripeSessionId.createdAt.toISOString()})`)
    }
    if (orderWithPaymentMethod) {
      console.log(`   Orden con paymentMethod: ${orderWithPaymentMethod.id} (creada: ${orderWithPaymentMethod.createdAt.toISOString()})`)
    }
    
    if (orderWithStripeSessionId && orderWithPaymentMethod) {
      // Determinar cuál mantener (la más antigua)
      const keepOrder = orderWithStripeSessionId.createdAt < orderWithPaymentMethod.createdAt 
        ? orderWithStripeSessionId 
        : orderWithPaymentMethod
      
      const deleteOrder = keepOrder === orderWithStripeSessionId 
        ? orderWithPaymentMethod 
        : orderWithStripeSessionId
      
      console.log(`\n✅ Manteniendo orden: ${keepOrder.id} (más antigua)`)
      console.log(`🗑️ Eliminando orden: ${deleteOrder.id} (más reciente)`)
      
      // Eliminar los items de la orden a eliminar
      await prisma.orderItem.deleteMany({
        where: {
          orderId: deleteOrder.id
        }
      })
      console.log(`   ✅ Items eliminados de la orden ${deleteOrder.id}`)
      
      // Eliminar la orden duplicada
      await prisma.order.delete({
        where: {
          id: deleteOrder.id
        }
      })
      console.log(`   ✅ Orden ${deleteOrder.id} eliminada`)
      
      // Asegurar que la orden mantenida tenga ambos campos correctos
      await prisma.order.update({
        where: { id: keepOrder.id },
        data: {
          stripeSessionId: sessionId,
          paymentMethod: sessionId
        }
      })
      console.log(`   🔧 Orden ${keepOrder.id} actualizada con ambos campos correctos`)
      
    } else if (orderWithStripeSessionId && !orderWithPaymentMethod) {
      // Solo actualizar el paymentMethod
      await prisma.order.update({
        where: { id: orderWithStripeSessionId.id },
        data: { paymentMethod: sessionId }
      })
      console.log(`🔧 Actualizado paymentMethod para orden ${orderWithStripeSessionId.id}`)
      
    } else if (orderWithPaymentMethod && !orderWithStripeSessionId) {
      // Solo actualizar el stripeSessionId
      await prisma.order.update({
        where: { id: orderWithPaymentMethod.id },
        data: { stripeSessionId: sessionId }
      })
      console.log(`🔧 Actualizado stripeSessionId para orden ${orderWithPaymentMethod.id}`)
      
    } else {
      console.log('❌ No se encontraron las órdenes problemáticas')
    }
    
    // Verificar el resultado final
    console.log('\n📊 Verificando resultado final...')
    const finalOrders = await prisma.order.findMany({
      where: {
        OR: [
          { stripeSessionId: sessionId },
          { paymentMethod: sessionId }
        ]
      }
    })
    
    console.log(`✅ Órdenes finales para session ${sessionId}: ${finalOrders.length}`)
    finalOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ID: ${order.id} | stripeSessionId: ${order.stripeSessionId || 'NO'} | paymentMethod: ${order.paymentMethod || 'NO'}`)
    })
    
  } catch (error) {
    console.error('❌ Error al corregir duplicado específico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSpecificDuplicate()