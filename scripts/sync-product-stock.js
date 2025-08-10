const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function syncProductStock() {
  try {
    console.log('🔄 Sincronizando stock de productos con variantes...')
    
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
    
    console.log(`📦 Encontrados ${productsWithVariants.length} productos con variantes`)
    
    let updatedCount = 0
    
    for (const product of productsWithVariants) {
      // Calcular el stock total de las variantes
      const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0)
      
      // Solo actualizar si hay diferencia
      if (product.stock !== totalStock) {
        console.log(`🔧 Actualizando producto: ${product.name}`)
        console.log(`   Stock actual: ${product.stock} → Nuevo stock: ${totalStock}`)
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: totalStock,
            isActive: totalStock > 0
          }
        })
        
        updatedCount++
      } else {
        console.log(`✅ Producto ya sincronizado: ${product.name} (stock: ${totalStock})`)
      }
    }
    
    console.log(`\n🎉 Sincronización completada!`)
    console.log(`📊 Productos actualizados: ${updatedCount}`)
    console.log(`📊 Productos ya sincronizados: ${productsWithVariants.length - updatedCount}`)
    
  } catch (error) {
    console.error('❌ Error al sincronizar stock:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
syncProductStock()
