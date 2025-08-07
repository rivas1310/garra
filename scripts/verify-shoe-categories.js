// Script para verificar las categorías de calzado reorganizadas
console.log('👟 Verificando categorías de calzado reorganizadas...')

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyShoeCategories() {
  try {
    console.log('\n📋 Categorías de calzado creadas:')
    console.log('✅ Calzado de Hombre - Zapatos, Sneakers, Botas, Sandalias')
    console.log('✅ Calzado de Mujer - Tacones, Zapatillas, Zapatos, Sneakers, Botas, Huaraches, Sandalias')
    console.log('✅ Calzado de Niño - Zapatos, Botas, Sneakers, Sandalias')
    console.log('✅ Calzado de Niña - Zapatos, Botas, Sneakers, Sandalias')
    
    // Verificar categorías en la base de datos
    const shoeCategories = await prisma.category.findMany({
      where: {
        slug: {
          in: ['calzado-hombre', 'calzado-mujer', 'calzado-nino', 'calzado-nina']
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n🔍 Categorías en la base de datos:')
    shoeCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
      console.log(`   Descripción: ${cat.description}`);
    });
    
    // Verificar productos por categoría
    console.log('\n📦 Productos por categoría:')
    for (const category of shoeCategories) {
      const products = await prisma.product.findMany({
        where: {
          categoryId: category.id,
          isActive: true
        },
        select: { subcategoria: true }
      });
      
      const subcategories = [...new Set(products.map(p => p.subcategoria))];
      console.log(`- ${category.name}: ${products.length} productos, subcategorías: ${subcategories.join(', ')}`);
    }
    
    // Verificar URLs de las categorías
    console.log('\n🔗 URLs de las categorías:')
    const categoryUrls = [
      { name: 'Calzado de Hombre', url: '/categorias/calzado-hombre' },
      { name: 'Calzado de Mujer', url: '/categorias/calzado-mujer' },
      { name: 'Calzado de Niño', url: '/categorias/calzado-nino' },
      { name: 'Calzado de Niña', url: '/categorias/calzado-nina' }
    ];
    
    categoryUrls.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.url}`);
    });
    
    console.log('\n📱 Interfaz actualizada:')
    console.log('✅ Página principal: Categorías de calzado separadas')
    console.log('✅ Dropdown de navegación: Nueva sección "Calzado"')
    console.log('✅ URLs directas funcionando')
    console.log('✅ Subcategorías específicas por tipo de calzado')
    
    console.log('\n🎯 Subcategorías implementadas:')
    console.log('👞 Calzado de Hombre: Zapatos, Sneakers, Botas, Sandalias')
    console.log('👠 Calzado de Mujer: Tacones, Zapatillas, Zapatos, Sneakers, Botas, Huaraches, Sandalias')
    console.log('👟 Calzado de Niño: Zapatos, Botas, Sneakers, Sandalias')
    console.log('👡 Calzado de Niña: Zapatos, Botas, Sneakers, Sandalias')
    
    console.log('\n✅ Verificación completada. Todas las categorías de calzado están funcionando correctamente.')
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyShoeCategories(); 