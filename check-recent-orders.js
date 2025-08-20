const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkRecentOrders() {
  try {
    console.log('🔍 Verificando órdenes recientes...')
    
    // Buscar órdenes de las últimas 24 horas
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: yesterday
        }
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 Órdenes encontradas en las últimas 24 horas: ${recentOrders.length}`)
    
    if (recentOrders.length === 0) {
      console.log('ℹ️ No hay órdenes recientes para verificar')
      return
    }
    
    for (const order of recentOrders) {
      console.log(`\n📋 Orden: ${order.id}`)
      console.log(`📅 Fecha: ${order.createdAt}`)
      console.log(`💰 Estado: ${order.status}`)
      console.log(`💳 Pago: ${order.paymentStatus}`)
      console.log(`🔗 Stripe Session: ${order.stripeSessionId}`)
      console.log(`📦 Items: ${order.items.length}`)
      
      for (const item of order.items) {
        console.log(`  - ${item.product.name}`)
        if (item.variant) {
          console.log(`    Variante: ${item.variant.name} (Stock actual: ${item.variant.stock})`)
        }
        console.log(`    Cantidad: ${item.quantity}`)
        console.log(`    Stock actual del producto: ${item.product.stock}`)
        console.log(`    Producto activo: ${item.product.isActive}`)
      }
    }
    
    // Verificar si hay órdenes PAID/CONFIRMED que podrían no haber descontado stock
    const paidOrders = recentOrders.filter(order => 
      order.paymentStatus === 'PAID' && order.status === 'CONFIRMED'
    )
    
    console.log(`\n✅ Órdenes pagadas y confirmadas: ${paidOrders.length}`)
    
    // Buscar productos que podrían tener stock inconsistente
    console.log('\n🔍 Verificando consistencia de stock...')
    
    const productsWithVariants = await prisma.product.findMany({
      where: {
        variants: {
          some: {}
        }
      },
      include: {
        variants: true
      }
    })
    
    let inconsistentProducts = 0
    
    for (const product of productsWithVariants) {
      const variantStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
      
      if (product.stock !== variantStock) {
        console.log(`❌ Inconsistencia en ${product.name}:`)
        console.log(`   Stock principal: ${product.stock}`)
        console.log(`   Stock de variantes: ${variantStock}`)
        inconsistentProducts++
      }
    }
    
    if (inconsistentProducts === 0) {
      console.log('✅ Todos los productos tienen stock consistente')
    } else {
      console.log(`❌ Se encontraron ${inconsistentProducts} productos con stock inconsistente`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRecentOrders()