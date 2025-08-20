const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDuplicateOrders() {
  try {
    console.log('🔍 Verificando pedidos duplicados...')
    
    // Buscar pedidos con el mismo paymentMethod (stripeSessionId)
    const duplicates = await prisma.order.groupBy({
      by: ['paymentMethod'],
      having: {
        paymentMethod: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        paymentMethod: true
      }
    })
    
    if (duplicates.length === 0) {
      console.log('✅ No se encontraron pedidos duplicados por stripeSessionId')
    } else {
      console.log(`❌ Se encontraron ${duplicates.length} grupos de pedidos duplicados:`)
      
      for (const duplicate of duplicates) {
        console.log(`\n📋 Stripe Session ID: ${duplicate.paymentMethod}`)
        console.log(`   Cantidad de pedidos: ${duplicate._count.paymentMethod}`)
        
        // Obtener detalles de los pedidos duplicados
        const orders = await prisma.order.findMany({
          where: {
            paymentMethod: duplicate.paymentMethod
          },
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
            customerEmail: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        })
        
        orders.forEach((order, index) => {
          console.log(`   ${index + 1}. ID: ${order.id} | Status: ${order.status} | Payment: ${order.paymentStatus} | Total: $${order.total} | Created: ${order.createdAt.toISOString()} | Email: ${order.customerEmail}`)
        })
      }
    }
    
    // Estadísticas generales
    const totalOrders = await prisma.order.count()
    const uniqueSessionIds = await prisma.order.groupBy({
      by: ['paymentMethod']
    })
    
    console.log(`\n📊 Estadísticas:`)
    console.log(`   Total de pedidos: ${totalOrders}`)
    console.log(`   Sesiones únicas: ${uniqueSessionIds.length}`)
    console.log(`   Diferencia: ${totalOrders - uniqueSessionIds.length} (pedidos duplicados)`)
    
  } catch (error) {
    console.error('❌ Error al verificar duplicados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDuplicateOrders()