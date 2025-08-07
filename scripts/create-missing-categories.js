// Script para crear las categorías faltantes
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingCategories() {
  try {
    console.log('📋 Creando categorías faltantes...');
    
    // Categorías que necesitamos crear
    const missingCategories = [
      {
        name: 'Niñas',
        slug: 'ninas',
        description: 'Ropa elegante y divertida para niñas'
      },
      {
        name: 'Niños',
        slug: 'ninos',
        description: 'Ropa cómoda y resistente para niños'
      },
      {
        name: 'Zapatos Infantiles',
        slug: 'calzado-infantil',
        description: 'Calzado cómodo y seguro para niños'
      }
    ];
    
    console.log('\n🔍 Verificando categorías existentes...');
    const existingCategories = await prisma.category.findMany({
      select: { slug: true }
    });
    const existingSlugs = existingCategories.map(cat => cat.slug);
    
    // Filtrar solo las que no existen
    const categoriesToCreate = missingCategories.filter(cat => 
      !existingSlugs.includes(cat.slug)
    );
    
    if (categoriesToCreate.length === 0) {
      console.log('✅ Todas las categorías ya existen en la base de datos.');
      return;
    }
    
    console.log(`\n📝 Creando ${categoriesToCreate.length} categorías...`);
    
    for (const category of categoriesToCreate) {
      console.log(`- Creando: ${category.name} (${category.slug})`);
      
      const createdCategory = await prisma.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description
        }
      });
      
      console.log(`  ✅ Creada con ID: ${createdCategory.id}`);
    }
    
    console.log('\n✅ Todas las categorías han sido creadas exitosamente.');
    
    // Verificar que se crearon correctamente
    console.log('\n🔍 Verificando categorías creadas:');
    const allCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });
    
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error al crear categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingCategories(); 