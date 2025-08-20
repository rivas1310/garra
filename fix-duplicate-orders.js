const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDuplicateOrders() {
  try {
    console.log('🔍 Buscando órdenes duplicadas...')
    
    // Buscar órdenes que tengan el mismo stripeSessionId pero diferentes IDs
    const duplicateGroups = await prisma.order.groupBy({
      by: ['stripeSessionId'],
      having: {
        stripeSessionId: {
          not: null
        }
      },
      _count: {
        id: true
      }
    })
    
    const duplicates = duplicateGroups.filter(group => group._count.id > 1)
    
    if (duplicates.length === 0) {
      console.log('✅ No se encontraron órdenes duplicadas por stripeSessionId')
    } else {
      console.log(`⚠️ Se encontraron ${duplicates.length} grupos de órdenes duplicadas`)
      
      for (const duplicate of duplicates) {
        console.log(`\n📋 Procesando duplicados para session: ${duplicate.stripeSessionId}`)
        
        // Obtener todas las órdenes con este stripeSessionId
        const orders = await prisma.order.findMany({
          where: {
            stripeSessionId: duplicate.stripeSessionId
          },
          orderBy: {
            createdAt: 'asc' // La más antigua primero
          },
          include: {
            items: true
          }
        })
        
        console.log(`   Encontradas ${orders.length} órdenes duplicadas:`)
        orders.forEach((order, index) => {
          console.log(`   ${index + 1}. ID: ${order.id} | Status: ${order.status} | Payment: ${order.paymentStatus} | Total: $${order.total} | Created: ${order.createdAt.toISOString()} | Items: ${order.items.length}`)
        })
        
        // Mantener la primera orden (más antigua) y eliminar las demás
        const [keepOrder, ...deleteOrders] = orders
        
        console.log(`   ✅ Manteniendo orden: ${keepOrder.id} (creada: ${keepOrder.createdAt.toISOString()})`)
        
        for (const orderToDelete of deleteOrders) {
          console.log(`   🗑️ Eliminando orden duplicada: ${orderToDelete.id}`)
          
          // Primero eliminar los OrderItems
          await prisma.orderItem.deleteMany({
            where: {
              orderId: orderToDelete.id
            }
          })
          
          // Luego eliminar la orden
          await prisma.order.delete({
            where: {
              id: orderToDelete.id
            }
          })
          
          console.log(`   ✅ Orden ${orderToDelete.id} eliminada correctamente`)
        }
        
        // Asegurar que la orden mantenida tenga paymentMethod = stripeSessionId
        if (keepOrder.paymentMethod !== keepOrder.stripeSessionId) {
          await prisma.order.update({
            where: { id: keepOrder.id },
            data: { paymentMethod: keepOrder.stripeSessionId }
          })
          console.log(`   🔧 Actualizado paymentMethod para orden ${keepOrder.id}`)
        }
      }
    }
    
    // Verificar órdenes que tengan paymentMethod diferente a stripeSessionId
    console.log('\n🔍 Verificando consistencia de paymentMethod...')
    
    const inconsistentOrders = await prisma.order.findMany({
      where: {
        AND: [
          { stripeSessionId: { not: null } },
          { paymentMethod: { not: null } },
          {
            NOT: {
              paymentMethod: {
                equals: prisma.order.fields.stripeSessionId
              }
            }
          }
        ]
      }
    })
    
    if (inconsistentOrders.length > 0) {
      console.log(`⚠️ Encontradas ${inconsistentOrders.length} órdenes con paymentMethod inconsistente`)
      
      for (const order of inconsistentOrders) {
        console.log(`   🔧 Actualizando orden ${order.id}: paymentMethod "${order.paymentMethod}" -> "${order.stripeSessionId}"`)
        
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentMethod: order.stripeSessionId }
        })
      }
      
      console.log('✅ Todas las inconsistencias corregidas')
    } else {
      console.log('✅ Todos los paymentMethod son consistentes')
    }
    
    // Estadísticas finales
    const totalOrders = await prisma.order.count()
    const uniqueSessionIds = await prisma.order.groupBy({
      by: ['stripeSessionId'],
      where: {
        stripeSessionId: { not: null }
      }
    })
    
    console.log(`\n📊 Estadísticas finales:`)
    console.log(`   Total de pedidos: ${totalOrders}`)
    console.log(`   Sesiones únicas de Stripe: ${uniqueSessionIds.length}`)
    console.log(`   Diferencia: ${totalOrders - uniqueSessionIds.length}`)
    
  } catch (error) {
    console.error('❌ Error al corregir duplicados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDuplicateOrders()