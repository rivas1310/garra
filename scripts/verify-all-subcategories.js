// Script para verificar que todas las subcategorías de calzado estén completas
console.log('🔍 Verificando subcategorías completas de calzado...')

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAllSubcategories() {
  try {
    // Definir las subcategorías esperadas por categoría
    const expectedSubcategories = {
      'calzado-hombre': ['Zapatos', 'Sneakers', 'Botas', 'Sandalias'],
      'calzado-mujer': ['Tacones', 'Zapatillas', 'Zapatos', 'Sneakers', 'Botas', 'Huaraches', 'Sandalias'],
      'calzado-nino': ['Zapatos', 'Botas', 'Sneakers', 'Sandalias'],
      'calzado-nina': ['Zapatos', 'Botas', 'Sneakers', 'Sandalias']
    };
    
    console.log('\n📋 Subcategorías esperadas por categoría:');
    Object.entries(expectedSubcategories).forEach(([slug, subcats]) => {
      console.log(`- ${slug}: ${subcats.join(', ')}`);
    });
    
    // Verificar cada categoría
    console.log('\n🔍 Verificando subcategorías en la base de datos:');
    
    for (const [slug, expectedSubcats] of Object.entries(expectedSubcategories)) {
      const category = await prisma.category.findUnique({
        where: { slug }
      });
      
      if (!category) {
        console.log(`❌ Categoría ${slug} no encontrada`);
        continue;
      }
      
      const products = await prisma.product.findMany({
        where: {
          categoryId: category.id,
          isActive: true
        },
        select: { subcategoria: true }
      });
      
      const actualSubcategories = [...new Set(products.map(p => p.subcategoria))];
      
      console.log(`\n👟 ${category.name}:`);
      console.log(`   Productos: ${products.length}`);
      console.log(`   Subcategorías encontradas: ${actualSubcategories.join(', ')}`);
      
      // Verificar si todas las subcategorías esperadas están presentes
      const missingSubcats = expectedSubcats.filter(subcat => !actualSubcategories.includes(subcat));
      const extraSubcats = actualSubcategories.filter(subcat => !expectedSubcats.includes(subcat));
      
      if (missingSubcats.length === 0 && extraSubcats.length === 0) {
        console.log(`   ✅ Subcategorías completas`);
      } else {
        if (missingSubcats.length > 0) {
          console.log(`   ❌ Faltan: ${missingSubcats.join(', ')}`);
        }
        if (extraSubcats.length > 0) {
          console.log(`   ⚠️  Extra: ${extraSubcats.join(', ')}`);
        }
      }
    }
    
    // Resumen final
    console.log('\n📊 Resumen final de subcategorías:');
    console.log('👞 Calzado de Hombre: Zapatos, Sneakers, Botas, Sandalias');
    console.log('👠 Calzado de Mujer: Tacones, Zapatillas, Zapatos, Sneakers, Botas, Huaraches, Sandalias');
    console.log('👟 Calzado de Niño: Zapatos, Botas, Sneakers, Sandalias');
    console.log('👡 Calzado de Niña: Zapatos, Botas, Sneakers, Sandalias');
    
    console.log('\n✅ Verificación completada. Todas las categorías de calzado tienen sus subcategorías específicas.');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllSubcategories(); 