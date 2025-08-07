// Script para verificar categorías en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('📋 Verificando categorías en la base de datos...');
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`\n✅ Categorías existentes (${categories.length}):`);
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (slug: ${cat.slug})`);
      if (cat.description) {
        console.log(`   Descripción: ${cat.description}`);
      }
    });
    
    // Verificar si existen las categorías que necesitamos
    const requiredSlugs = ['ninas', 'ninos', 'calzado-infantil'];
    const existingSlugs = categories.map(cat => cat.slug);
    
    console.log('\n🔍 Verificando categorías requeridas:');
    requiredSlugs.forEach(slug => {
      const exists = existingSlugs.includes(slug);
      console.log(`- ${slug}: ${exists ? '✅ Existe' : '❌ FALTA'}`);
    });
    
    // Mostrar productos por categoría
    console.log('\n📦 Productos por categoría:');
    for (const category of categories) {
      const productCount = await prisma.product.count({
        where: {
          categoryId: category.id,
          isActive: true
        }
      });
      console.log(`- ${category.name}: ${productCount} productos activos`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories(); 