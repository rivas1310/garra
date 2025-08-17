const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categorias = [
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
      name: 'Accesorios', 
      slug: 'accesorios', 
      description: 'Accesorios de moda',
      image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
    },
    { 
      name: 'Calzado', 
      slug: 'calzado', 
      description: 'Todo tipo de calzado',
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
    },
  ];

  console.log('Iniciando seed de categorías...');
  for (const cat of categorias) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        description: cat.description,
        image: cat.image
      },
      create: cat,
    });
    console.log(`Categoría '${cat.name}' procesada correctamente`);
  }
  console.log('Seed de categorías completado');
}

main()
  .catch(e => { 
    console.error('Error durante el seed:', e); 
    process.exit(1); 
  })
  .finally(() => prisma.$disconnect());