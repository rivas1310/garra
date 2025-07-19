import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categorias = [
    { name: 'Mujer', slug: 'mujer' },
    { name: 'Hombre', slug: 'hombre' },
    { name: 'Accesorios', slug: 'accesorios' },
    { name: 'Calzado', slug: 'calzado' },
    { name: 'Bolsos', slug: 'bolsos' },
    { name: 'Deportes', slug: 'deportes' },
  ];

  for (const cat of categorias) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Categorías insertadas');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect()); 