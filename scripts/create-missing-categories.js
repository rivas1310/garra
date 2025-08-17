// Script para crear las categorías faltantes
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingCategories() {
  try {
    log.error('📋 Creando categorías faltantes...');
    
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
    
    log.error('\n🔍 Verificando categorías existentes...');
    const existingCategories = await prisma.category.findMany({
      select: { slug: true }
    });
    const existingSlugs = existingCategories.map(cat => cat.slug);
    
    // Filtrar solo las que no existen
    const categoriesToCreate = missingCategories.filter(cat => 
      !existingSlugs.includes(cat.slug)
    );
    
    if (categoriesToCreate.length === 0) {
      log.error('✅ Todas las categorías ya existen en la base de datos.');
      return;
    }
    
    log.error(`\n📝 Creando ${categoriesToCreate.length} categorías...`);
    
    for (const category of categoriesToCreate) {
      log.error(`- Creando: ${category.name} (${category.slug})`);
      
      const createdCategory = await prisma.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description
        }
      });
      
      log.error(`  ✅ Creada con ID: ${createdCategory.id}`);
    }
    
    log.error('\n✅ Todas las categorías han sido creadas exitosamente.');
    
    // Verificar que se crearon correctamente
    log.error('\n🔍 Verificando categorías creadas:');
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
      log.error(`${index + 1}. ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    log.error('❌ Error al crear categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingCategories(); 