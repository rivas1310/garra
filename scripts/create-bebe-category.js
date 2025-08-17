const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBebeCategory() {
  try {
    log.error('👶 Creando categoría "Bebé"...\n');

    // Verificar si ya existe la categoría
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: 'bebe' },
          { slug: 'bebé' },
          { name: { contains: 'bebé', mode: 'insensitive' } },
          { name: { contains: 'bebe', mode: 'insensitive' } }
        ]
      }
    });

    if (existingCategory) {
      log.error('⚠️ La categoría "Bebé" ya existe:');
      log.error(`   - Nombre: ${existingCategory.name}`);
      log.error(`   - Slug: ${existingCategory.slug}`);
      log.error(`   - ID: ${existingCategory.id}`);
      return;
    }

    // Crear la nueva categoría
    const newCategory = await prisma.category.create({
      data: {
        name: 'Bebé',
        slug: 'bebe',
        description: 'Ropa y accesorios para bebés de 0 a 24 meses',
        image: '/img/categories/bebe.jpg' // Puedes cambiar esta imagen
      }
    });

    log.error('✅ Categoría "Bebé" creada exitosamente:');
    log.error(`   - ID: ${newCategory.id}`);
    log.error(`   - Nombre: ${newCategory.name}`);
    log.error(`   - Slug: ${newCategory.slug}`);
    log.error(`   - Descripción: ${newCategory.description}`);

    // Verificar que se creó correctamente
    const createdCategory = await prisma.category.findUnique({
      where: { id: newCategory.id }
    });

    if (createdCategory) {
      log.error('\n✅ Verificación exitosa - La categoría está disponible en la base de datos');
    } else {
      log.error('\n❌ Error - La categoría no se pudo verificar');
    }

  } catch (error) {
    log.error('❌ Error al crear la categoría "Bebé":', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBebeCategory(); 