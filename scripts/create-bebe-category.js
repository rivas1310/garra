const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBebeCategory() {
  try {
    console.log('👶 Creando categoría "Bebé"...\n');

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
      console.log('⚠️ La categoría "Bebé" ya existe:');
      console.log(`   - Nombre: ${existingCategory.name}`);
      console.log(`   - Slug: ${existingCategory.slug}`);
      console.log(`   - ID: ${existingCategory.id}`);
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

    console.log('✅ Categoría "Bebé" creada exitosamente:');
    console.log(`   - ID: ${newCategory.id}`);
    console.log(`   - Nombre: ${newCategory.name}`);
    console.log(`   - Slug: ${newCategory.slug}`);
    console.log(`   - Descripción: ${newCategory.description}`);

    // Verificar que se creó correctamente
    const createdCategory = await prisma.category.findUnique({
      where: { id: newCategory.id }
    });

    if (createdCategory) {
      console.log('\n✅ Verificación exitosa - La categoría está disponible en la base de datos');
    } else {
      console.log('\n❌ Error - La categoría no se pudo verificar');
    }

  } catch (error) {
    console.error('❌ Error al crear la categoría "Bebé":', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBebeCategory(); 