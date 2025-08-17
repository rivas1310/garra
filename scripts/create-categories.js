// Script para crear categorías en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    log.error('Creando categorías...');
    
    // Definir las categorías a crear
    const categories = [
      {
        name: 'Mujer',
        slug: 'mujer',
        description: 'Ropa y accesorios para mujer',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
      },
      {
        name: 'Hombre',
        slug: 'hombre',
        description: 'Ropa y accesorios para hombre',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
      },
      {
        name: 'Calzado',
        slug: 'calzado',
        description: 'Todo tipo de calzado',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
      },
      {
        name: 'Accesorios',
        slug: 'accesorios',
        description: 'Accesorios de moda',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
      },
      {
        name: 'Bolsos',
        slug: 'bolsos',
        description: 'Bolsos y carteras',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
      },
      {
        name: 'Deportes',
        slug: 'deportes',
        description: 'Ropa y accesorios deportivos',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
      }
    ];
    
    // Crear las categorías
    for (const category of categories) {
      // Verificar si la categoría ya existe
      const existingCategory = await prisma.category.findUnique({
        where: { slug: category.slug }
      });
      
      if (!existingCategory) {
        // Crear la categoría si no existe
        await prisma.category.create({
          data: category
        });
        log.error(`Categoría '${category.name}' creada correctamente`);
      } else {
        log.error(`La categoría '${category.name}' ya existe`);
      }
    }
    
    log.error('Proceso completado');
  } catch (error) {
    log.error('Error al crear categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();