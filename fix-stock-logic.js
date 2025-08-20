const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function analyzeStockLogic() {
  console.log('🔍 Analizando lógica de stock...')
  
  try {
    // Obtener todos los productos con sus variantes
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        orderItems: {
          include: {
            order: true
          }
        }
      }
    })
    
    console.log(`📦 Total de productos: ${products.length}`)
    
    for (const product of products) {
      console.log(`\n--- Producto: ${product.name} ---`)
      console.log(`Stock principal: ${product.stock}`)
      console.log(`Variantes: ${product.variants.length}`)
      
      if (product.variants.length > 0) {
        // Calcular stock total de variantes
        const totalVariantStock = product.variants.reduce((sum, variant) => {
          console.log(`  - ${variant.size || 'N/A'} ${variant.color || 'N/A'}: ${variant.stock}`)
          return sum + variant.stock
        }, 0)
        
        console.log(`Stock total de variantes: ${totalVariantStock}`)
        
        // Verificar si el stock principal coincide
        if (product.stock !== totalVariantStock) {
          console.log(`⚠️  INCONSISTENCIA: Stock principal (${product.stock}) != Stock de variantes (${totalVariantStock})`)
          
          // Corregir el stock principal
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: totalVariantStock }
          })
          
          console.log(`✅ Stock principal corregido a: ${totalVariantStock}`)
        } else {
          console.log(`✅ Stock consistente`)
        }
      } else {
        console.log(`📦 Producto sin variantes - Stock: ${product.stock}`)
      }
      
      // Mostrar órdenes que afectaron este producto
      const orderItems = product.orderItems.filter(item => 
        item.order.status === 'CONFIRMED' || item.order.status === 'DELIVERED'
      )
      
      if (orderItems.length > 0) {
        console.log(`📋 Órdenes confirmadas que afectaron este producto: ${orderItems.length}`)
        orderItems.forEach(item => {
          console.log(`  - Orden ${item.order.id}: -${item.quantity} (${item.variantId ? 'variante' : 'principal'})`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeStockLogic()