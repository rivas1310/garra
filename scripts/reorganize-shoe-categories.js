// Script para reorganizar las categorías de calzado
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reorganizeShoeCategories() {
  try {
    log.error('👟 Reorganizando categorías de calzado...');
    
    // 1. Crear nuevas categorías de calzado (solo las que no existen)
    const newShoeCategories = [
      {
        name: 'Calzado de Hombre',
        slug: 'calzado-hombre',
        description: 'Zapatos, sneakers, botas y sandalias para hombres'
      },
      {
        name: 'Calzado de Niña',
        slug: 'calzado-nina',
        description: 'Zapatos, botas, sneakers y sandalias para niñas'
      }
    ];
    
    log.error('\n📝 Creando nuevas categorías de calzado...');
    
    // Verificar categorías existentes
    const existingCategories = await prisma.category.findMany({
      select: { slug: true }
    });
    const existingSlugs = existingCategories.map(cat => cat.slug);
    
    for (const category of newShoeCategories) {
      if (!existingSlugs.includes(category.slug)) {
        log.error(`- Creando: ${category.name} (${category.slug})`);
        
        const createdCategory = await prisma.category.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: category.description
          }
        });
        
        log.error(`  ✅ Creada con ID: ${createdCategory.id}`);
      } else {
        log.error(`- Saltando: ${category.name} (${category.slug}) - ya existe`);
      }
    }
    
    // 2. Actualizar la categoría "Calzado" existente a "Calzado de Mujer"
    log.error('\n🔄 Actualizando categoría "Calzado" a "Calzado de Mujer"...');
    
    const existingCalzado = await prisma.category.findUnique({
      where: { slug: 'calzado' }
    });
    
    if (existingCalzado) {
      // Primero eliminar la categoría duplicada si existe
      const duplicateCalzadoMujer = await prisma.category.findUnique({
        where: { slug: 'calzado-mujer' }
      });
      
      if (duplicateCalzadoMujer) {
        await prisma.category.delete({
          where: { slug: 'calzado-mujer' }
        });
        log.error('  🗑️  Eliminada categoría duplicada "calzado-mujer"');
      }
      
      await prisma.category.update({
        where: { slug: 'calzado' },
        data: {
          name: 'Calzado de Mujer',
          slug: 'calzado-mujer',
          description: 'Tacones, zapatillas, zapatos, sneakers, botas, huaraches y sandalias para mujeres'
        }
      });
      log.error('  ✅ Categoría "Calzado" actualizada a "Calzado de Mujer"');
    }
    
    // 3. Actualizar la categoría "Zapatos Infantiles" a "Calzado de Niño"
    log.error('\n🔄 Actualizando categoría "Zapatos Infantiles" a "Calzado de Niño"...');
    
    const existingCalzadoInfantil = await prisma.category.findUnique({
      where: { slug: 'calzado-infantil' }
    });
    
    if (existingCalzadoInfantil) {
      // Primero eliminar la categoría duplicada si existe
      const duplicateCalzadoNino = await prisma.category.findUnique({
        where: { slug: 'calzado-nino' }
      });
      
      if (duplicateCalzadoNino) {
        await prisma.category.delete({
          where: { slug: 'calzado-nino' }
        });
        log.error('  🗑️  Eliminada categoría duplicada "calzado-nino"');
      }
      
      await prisma.category.update({
        where: { slug: 'calzado-infantil' },
        data: {
          name: 'Calzado de Niño',
          slug: 'calzado-nino',
          description: 'Zapatos, botas, sneakers y sandalias para niños'
        }
      });
      log.error('  ✅ Categoría "Zapatos Infantiles" actualizada a "Calzado de Niño"');
    }
    
    // 4. Verificar todas las categorías
    log.error('\n🔍 Verificando todas las categorías de calzado:');
    const allCategories = await prisma.category.findMany({
      where: {
        slug: {
          in: ['calzado-hombre', 'calzado-mujer', 'calzado-nino', 'calzado-nina']
        }
      },
      orderBy: { name: 'asc' }
    });
    
    allCategories.forEach((cat, index) => {
      log.error(`${index + 1}. ${cat.name} (${cat.slug})`);
      log.error(`   Descripción: ${cat.description}`);
    });
    
    log.error('\n✅ Reorganización de categorías de calzado completada.');
    
  } catch (error) {
    log.error('❌ Error al reorganizar categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reorganizeShoeCategories(); 