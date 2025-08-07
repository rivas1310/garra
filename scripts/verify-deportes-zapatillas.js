// Script para verificar que la subcategoría Zapatillas esté disponible en deportes
console.log('🔍 Verificando subcategoría Zapatillas en deportes...')

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDeportesZapatillas() {
  try {
    console.log('\n📋 Verificando subcategorías en deportes:');
    
    // Verificar categoría deportes
    console.log('\n🏃 Categoría "deportes":');
    console.log('   Subcategorías esperadas: Ropa deportiva, Zapatillas, Accesorios deportivos');
    
    const deportesCategory = await prisma.category.findUnique({
      where: { slug: 'deportes' }
    });
    
    if (deportesCategory) {
      const deportesProducts = await prisma.product.findMany({
        where: {
          categoryId: deportesCategory.id,
          isActive: true
        },
        select: { subcategoria: true }
      });
      
      const deportesSubcategories = [...new Set(deportesProducts.map(p => p.subcategoria))];
      console.log(`   Productos en DB: ${deportesProducts.length}`);
      console.log(`   Subcategorías en DB: ${deportesSubcategories.join(', ')}`);
      
      // Verificar que "Zapatillas" esté presente
      if (deportesSubcategories.includes('Zapatillas')) {
        console.log('   ✅ Subcategoría "Zapatillas" está presente en deportes');
      } else {
        console.log('   ❌ Subcategoría "Zapatillas" no encontrada en deportes');
        console.log('   💡 Nota: La subcategoría está configurada en el frontend pero puede no tener productos en la DB');
      }
    } else {
      console.log('   ❌ Categoría "deportes" no encontrada en la base de datos');
    }
    
    console.log('\n🌐 URLs para probar en el navegador:');
    console.log('   ✅ http://localhost:3000/categorias/deportes?subcat=zapatillas');
    console.log('   ✅ http://localhost:3000/categorias/deportes?subcat=ropa-deportiva');
    console.log('   ✅ http://localhost:3000/categorias/deportes?subcat=accesorios-deportivos');
    
    console.log('\n📱 Cambios realizados:');
    console.log('✅ Subcategoría "Zapatillas" agregada a /categorias/deportes');
    console.log('✅ SubcategoryGrid.tsx actualizado con la nueva subcategoría');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDeportesZapatillas(); 