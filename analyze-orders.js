const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function analyzeOrders() {
  try {
    console.log('🔍 Analizando todas las órdenes en detalle...')
    
    // Obtener todas las órdenes
    const allOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })
    
    console.log(`\n📋 Total de órdenes encontradas: ${allOrders.length}`)
    
    allOrders.forEach((order, index) => {
      console.log(`\n--- Orden ${index + 1} ---`)
      console.log(`ID: ${order.id}`)
      console.log(`Usuario: ${order.user.name} (${order.user.email})`)
      console.log(`Status: ${order.status}`)
      console.log(`Payment Status: ${order.paymentStatus}`)
      console.log(`Total: $${order.total}`)
      console.log(`Stripe Session ID: ${order.stripeSessionId || 'NO DEFINIDO'}`)
      console.log(`Payment Method: ${order.paymentMethod || 'NO DEFINIDO'}`)
      console.log(`Customer Email: ${order.customerEmail || 'NO DEFINIDO'}`)
      console.log(`Customer Name: ${order.customerName || 'NO DEFINIDO'}`)
      console.log(`Created At: ${order.createdAt.toISOString()}`)
      console.log(`Items (${order.items.length}):`);
      order.items.forEach((item, itemIndex) => {
        console.log(`  ${itemIndex + 1}. ${item.product.name} - Qty: ${item.quantity} - Price: $${item.price}`)
      })
      
      // Verificar si hay problemas potenciales
      const issues = []
      if (!order.stripeSessionId) issues.push('Sin Stripe Session ID')
      if (!order.paymentMethod) issues.push('Sin Payment Method')
      if (order.stripeSessionId && order.paymentMethod && order.stripeSessionId !== order.paymentMethod) {
        issues.push('Stripe Session ID y Payment Method no coinciden')
      }
      if (!order.customerEmail) issues.push('Sin email del cliente')
      
      if (issues.length > 0) {
        console.log(`⚠️ PROBLEMAS DETECTADOS: ${issues.join(', ')}`)
      } else {
        console.log('✅ Orden sin problemas detectados')
      }
    })
    
    // Buscar órdenes con el mismo email y productos similares
    console.log('\n🔍 Buscando posibles duplicados por email y contenido...')
    
    const ordersByEmail = {}
    allOrders.forEach(order => {
      const email = order.customerEmail || order.user.email
      if (!ordersByEmail[email]) {
        ordersByEmail[email] = []
      }
      ordersByEmail[email].push(order)
    })
    
    Object.entries(ordersByEmail).forEach(([email, orders]) => {
      if (orders.length > 1) {
        console.log(`\n📧 Email ${email} tiene ${orders.length} órdenes:`)
        orders.forEach((order, index) => {
          console.log(`  ${index + 1}. ID: ${order.id} | Total: $${order.total} | Created: ${order.createdAt.toISOString()} | Items: ${order.items.length}`)
        })
        
        // Comparar contenido de las órdenes
        if (orders.length === 2) {
          const [order1, order2] = orders
          const sameTotal = Math.abs(order1.total - order2.total) < 0.01
          const sameItemCount = order1.items.length === order2.items.length
          
          if (sameTotal && sameItemCount) {
            console.log(`   ⚠️ POSIBLE DUPLICADO: Mismo total ($${order1.total}) y cantidad de items (${order1.items.length})`)
            
            // Comparar productos
            const products1 = order1.items.map(item => `${item.productId}-${item.quantity}`).sort()
            const products2 = order2.items.map(item => `${item.productId}-${item.quantity}`).sort()
            
            if (JSON.stringify(products1) === JSON.stringify(products2)) {
              console.log(`   🚨 DUPLICADO CONFIRMADO: Mismos productos y cantidades`)
              
              // Mostrar diferencias en timestamps
              const timeDiff = Math.abs(new Date(order1.createdAt) - new Date(order2.createdAt))
              const minutesDiff = Math.round(timeDiff / (1000 * 60))
              console.log(`   ⏰ Diferencia de tiempo: ${minutesDiff} minutos`)
              
              // Mostrar diferencias en identificadores
              console.log(`   🔍 Stripe Session IDs:`)
              console.log(`      Orden 1: ${order1.stripeSessionId || 'NO DEFINIDO'}`)
              console.log(`      Orden 2: ${order2.stripeSessionId || 'NO DEFINIDO'}`)
              console.log(`   🔍 Payment Methods:`)
              console.log(`      Orden 1: ${order1.paymentMethod || 'NO DEFINIDO'}`)
              console.log(`      Orden 2: ${order2.paymentMethod || 'NO DEFINIDO'}`)
            }
          }
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error al analizar órdenes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeOrders()