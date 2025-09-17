const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createInactiveProducts() {
  try {
    console.log('🔍 Buscando productos para desactivar...');
    
    // Obtener algunos productos existentes
    const products = await prisma.product.findMany({
      take: 5, // Tomar solo 5 productos
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📦 Encontrados ${products.length} productos`);
    
    // Desactivar algunos productos
    const productIds = products.slice(0, 3).map(p => p.id); // Desactivar los primeros 3
    
    console.log('❌ Desactivando productos:', productIds);
    
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds }
      },
      data: {
        isActive: false
      }
    });
    
    console.log(`✅ ${result.count} productos desactivados exitosamente`);
    
    // Verificar el resultado
    const inactiveProducts = await prisma.product.findMany({
      where: { isActive: false },
      select: { id: true, name: true, isActive: true }
    });
    
    console.log('📋 Productos inactivos actuales:', inactiveProducts);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInactiveProducts();
