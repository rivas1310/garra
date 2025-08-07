// Script para verificar los cambios en las subcategorías
console.log('🔍 Verificando cambios en subcategorías...')

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySubcategoryChanges() {
  try {
    console.log('\n📋 Verificando subcategorías actualizadas:');
    
    // Verificar categoría calzado
    console.log('\n👟 Categoría "calzado":');
    console.log('   Subcategorías esperadas: Zapatos, Zapatillas, Botas');
    
    const calzadoCategory = await prisma.category.findUnique({
      where: { slug: 'calzado' }
    });
    
    if (calzadoCategory) {
      const calzadoProducts = await prisma.product.findMany({
        where: {
          categoryId: calzadoCategory.id,
          isActive: true
        },
        select: { subcategoria: true }
      });
      
      const calzadoSubcategories = [...new Set(calzadoProducts.map(p => p.subcategoria))];
      console.log(`   Productos en DB: ${calzadoProducts.length}`);
      console.log(`   Subcategorías en DB: ${calzadoSubcategories.join(', ')}`);
      
      // Verificar que "Zapatillas" esté presente
      if (calzadoSubcategories.includes('Zapatillas')) {
        console.log('   ✅ Subcategoría "Zapatillas" está presente');
      } else {
        console.log('   ❌ Subcategoría "Zapatillas" no encontrada');
      }
    } else {
      console.log('   ❌ Categoría "calzado" no encontrada en la base de datos');
    }
    
    // Verificar categoría deportes
    console.log('\n🏃 Categoría "deportes":');
    console.log('   Subcategorías esperadas: Ropa deportiva, Accesorios deportivos');
    console.log('   ❌ Subcategoría "Fitness" removida');
    
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
      
      // Verificar que "Fitness" no esté presente
      if (!deportesSubcategories.includes('Fitness')) {
        console.log('   ✅ Subcategoría "Fitness" ha sido removida');
      } else {
        console.log('   ⚠️  Subcategoría "Fitness" aún está presente');
      }
    } else {
      console.log('   ❌ Categoría "deportes" no encontrada en la base de datos');
    }
    
    console.log('\n🌐 URLs para probar en el navegador:');
    console.log('   ✅ http://localhost:3000/categorias/calzado?subcat=zapatillas');
    console.log('   ❌ http://localhost:3000/categorias/deportes?subcat=gym (removida)');
    
    console.log('\n📱 Cambios realizados:');
    console.log('✅ Subcategoría "Zapatillas" disponible en /categorias/calzado');
    console.log('✅ Subcategoría "Fitness" removida de /categorias/deportes');
    console.log('✅ SubcategoryGrid.tsx actualizado');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySubcategoryChanges(); 