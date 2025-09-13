const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addProductTags() {
  try {
    console.log('Agregando etiquetas y ofertas a productos...');
    
    // Obtener algunos productos para actualizar
    const products = await prisma.product.findMany({
      take: 8,
      select: { id: true, name: true }
    });
    
    if (products.length === 0) {
      console.log('No se encontraron productos para actualizar.');
      return;
    }
    
    // Etiquetas de condición disponibles
    const conditionTags = [
      'LIKE_NEW',
      'PRE_LOVED', 
      'GENTLY_USED',
      'VINTAGE',
      'OUTLET_OVERSTOCK',
      'NEARLY_NEW'
    ];
    
    // Actualizar productos con etiquetas y ofertas
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const updates = {};
      
      // Agregar conditionTag a algunos productos (50% de probabilidad)
      if (i % 2 === 0) {
        updates.conditionTag = conditionTags[i % conditionTags.length];
      }
      
      // Marcar algunos como ofertas (30% de probabilidad)
      if (i % 3 === 0) {
        updates.isOnSale = true;
      }
      
      if (Object.keys(updates).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updates
        });
        
        console.log(`✅ Actualizado "${product.name}":`);
        if (updates.conditionTag) {
          console.log(`   - Etiqueta: ${updates.conditionTag}`);
        }
        if (updates.isOnSale) {
          console.log(`   - En oferta: ${updates.isOnSale}`);
        }
      }
    }
    
    console.log('\n🎉 Etiquetas agregadas exitosamente!');
    
    // Verificar resultados
    const updatedProducts = await prisma.product.findMany({
      where: {
        OR: [
          { conditionTag: { not: null } },
          { isOnSale: true }
        ]
      },
      select: {
        name: true,
        conditionTag: true,
        isOnSale: true
      },
      take: 10
    });
    
    console.log('\nProductos con etiquetas/ofertas:');
    updatedProducts.forEach(p => {
      console.log(`- ${p.name}:`);
      if (p.conditionTag) {
        console.log(`  📋 Etiqueta: ${p.conditionTag}`);
      }
      if (p.isOnSale) {
        console.log(`  🔥 En oferta`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductTags();