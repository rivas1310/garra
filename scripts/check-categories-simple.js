const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('🔍 Verificando categorías en la base de datos...\n');

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Total de categorías: ${categories.length}\n`);

    if (categories.length > 0) {
      console.log('📋 Categorías disponibles:');
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name}`);
        console.log(`   - Slug: ${category.slug}`);
        console.log(`   - Descripción: ${category.description || 'Sin descripción'}`);
        console.log('');
      });
    } else {
      console.log('❌ No hay categorías en la base de datos');
    }

    // Verificar específicamente la categoría "bebe"
    const bebeCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: 'bebe' },
          { slug: 'bebé' },
          { slug: 'bebe' },
          { name: { contains: 'bebe', mode: 'insensitive' } },
          { name: { contains: 'bebé', mode: 'insensitive' } }
        ]
      }
    });

    if (bebeCategory) {
      console.log('✅ Categoría "bebe" encontrada:');
      console.log(`   - Nombre: ${bebeCategory.name}`);
      console.log(`   - Slug: ${bebeCategory.slug}`);
    } else {
      console.log('❌ Categoría "bebe" NO encontrada');
    }

  } catch (error) {
    console.error('❌ Error al verificar categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories(); 