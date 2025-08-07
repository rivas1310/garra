/**
 * Script para verificar qué productos están siendo devueltos por la API
 * Simula exactamente lo que hace el componente FeaturedProducts
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFeaturedProducts() {
  try {
    console.log('🔍 Verificando productos destacados...\n');

    // Obtener todos los productos activos
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        isNew: true,
        isOnSale: true,
        isSecondHand: true,
        price: true,
        stock: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total de productos activos: ${allProducts.length}`);

    // Contar productos por tipo
    const newProducts = allProducts.filter(p => p.isNew);
    const onSaleProducts = allProducts.filter(p => p.isOnSale);
    const secondHandProducts = allProducts.filter(p => p.isSecondHand);

    console.log(`🆕 Productos nuevos: ${newProducts.length}`);
    console.log(`🏷️ Productos en oferta: ${onSaleProducts.length}`);
    console.log(`♻️ Productos de segunda mano: ${secondHandProducts.length}`);

    // Mostrar detalles de productos destacados
    const featuredProducts = allProducts.filter(p => p.isNew || p.isOnSale);
    
    if (featuredProducts.length > 0) {
      console.log('\n📋 Productos destacados:');
      featuredProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - Categoría: ${product.category?.name || 'Sin categoría'}`);
        console.log(`   - Precio: $${product.price}`);
        console.log(`   - Stock: ${product.stock}`);
        console.log(`   - Nuevo: ${product.isNew ? '✅' : '❌'}`);
        console.log(`   - En oferta: ${product.isOnSale ? '✅' : '❌'}`);
        console.log(`   - Segunda mano: ${product.isSecondHand ? '✅' : '❌'}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No hay productos destacados (isNew o isOnSale = true)');
      console.log('\n📋 Primeros 8 productos disponibles:');
      allProducts.slice(0, 8).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - Categoría: ${product.category?.name || 'Sin categoría'}`);
        console.log(`   - Precio: $${product.price}`);
        console.log(`   - Stock: ${product.stock}`);
        console.log(`   - Nuevo: ${product.isNew ? '✅' : '❌'}`);
        console.log(`   - En oferta: ${product.isOnSale ? '✅' : '❌'}`);
        console.log(`   - Segunda mano: ${product.isSecondHand ? '✅' : '❌'}`);
        console.log('');
      });
    }

    // Sugerir productos para marcar como destacados
    if (featuredProducts.length < 8) {
      console.log('\n💡 Sugerencias para productos destacados:');
      const suggestions = allProducts
        .filter(p => !p.isNew && !p.isOnSale)
        .slice(0, 8 - featuredProducts.length);
      
      suggestions.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error al verificar productos destacados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeaturedProducts(); 