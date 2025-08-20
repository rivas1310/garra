const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function syncAllStock() {
  console.log('🔄 Sincronizando todos los stocks...')
  
  try {
    // Obtener todos los productos con variantes
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
    
    console.log(`📦 Productos con variantes encontrados: ${productsWithVariants.length}`)
    
    let updatedCount = 0
    
    for (const product of productsWithVariants) {
      // Calcular stock total de variantes
      const totalVariantStock = product.variants.reduce((sum, variant) => {
        return sum + variant.stock
      }, 0)
      
      console.log(`\n--- ${product.name} ---`)
      console.log(`Stock actual: ${product.stock}`)
      console.log(`Stock calculado de variantes: ${totalVariantStock}`)
      
      if (product.stock !== totalVariantStock) {
        // Actualizar el stock principal
        await prisma.product.update({
          where: { id: product.id },
          data: { 
            stock: totalVariantStock,
            isActive: totalVariantStock > 0
          }
        })
        
        console.log(`✅ Stock actualizado: ${product.stock} → ${totalVariantStock}`)
        console.log(`✅ Estado activo: ${totalVariantStock > 0}`)
        updatedCount++
      } else {
        console.log(`✅ Stock ya sincronizado`)
      }
    }
    
    console.log(`\n🎉 Sincronización completada!`)
    console.log(`📊 Productos actualizados: ${updatedCount}/${productsWithVariants.length}`)
    
    // Mostrar resumen final
    console.log('\n📋 Resumen final:')
    const allProducts = await prisma.product.findMany({
      include: {
        variants: true
      }
    })
    
    const withVariants = allProducts.filter(p => p.variants.length > 0)
    const withoutVariants = allProducts.filter(p => p.variants.length === 0)
    const activeProducts = allProducts.filter(p => p.isActive)
    const inactiveProducts = allProducts.filter(p => !p.isActive)
    
    console.log(`- Total productos: ${allProducts.length}`)
    console.log(`- Con variantes: ${withVariants.length}`)
    console.log(`- Sin variantes: ${withoutVariants.length}`)
    console.log(`- Activos: ${activeProducts.length}`)
    console.log(`- Inactivos: ${inactiveProducts.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncAllStock()