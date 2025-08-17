const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function syncProductStock() {
  try {
    log.error('🔄 Sincronizando stock de productos con variantes...')
    
    // Obtener todos los productos que tienen variantes
    const productsWithVariants = await prisma.product.findMany({
      include: {
        variants: true
      },
      where: {
        variants: {
          some: {}
        }
      }
    })
    
    log.error(`📦 Encontrados ${productsWithVariants.length} productos con variantes`)
    
    let updatedCount = 0
    
    for (const product of productsWithVariants) {
      // Calcular el stock total de las variantes
      const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0)
      
      // Solo actualizar si hay diferencia
      if (product.stock !== totalStock) {
        log.error(`🔧 Actualizando producto: ${product.name}`)
        log.error(`   Stock actual: ${product.stock} → Nuevo stock: ${totalStock}`)
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: totalStock,
            isActive: totalStock > 0
          }
        })
        
        updatedCount++
      } else {
        log.error(`✅ Producto ya sincronizado: ${product.name} (stock: ${totalStock})`)
      }
    }
    
    log.error(`\n🎉 Sincronización completada!`)
    log.error(`📊 Productos actualizados: ${updatedCount}`)
    log.error(`📊 Productos ya sincronizados: ${productsWithVariants.length - updatedCount}`)
    
  } catch (error) {
    log.error('❌ Error al sincronizar stock:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
syncProductStock()
