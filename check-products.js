const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('Verificando productos en la base de datos...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        conditionTag: true,
        isOnSale: true
      },
      take: 10
    });
    
    console.log('\nProductos encontrados:');
    products.forEach(p => {
      console.log(`- ${p.name}:`);
      console.log(`  conditionTag: ${p.conditionTag || 'null'}`);
      console.log(`  isOnSale: ${p.isOnSale}`);
      console.log('');
    });
    
    // Contar productos con etiquetas
    const withConditionTag = products.filter(p => p.conditionTag).length;
    const onSale = products.filter(p => p.isOnSale).length;
    
    console.log(`Resumen:`);
    console.log(`- Productos con conditionTag: ${withConditionTag}/${products.length}`);
    console.log(`- Productos en oferta: ${onSale}/${products.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();