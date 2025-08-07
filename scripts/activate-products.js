const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Activar todos los productos
    const result = await prisma.product.updateMany({
      where: { isActive: false },
      data: { isActive: true }
    });
    
    console.log(`Productos activados: ${result.count}`);
    
    // Verificar productos después de la actualización
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      }
    });
    
    console.log(`Productos encontrados: ${products.length}`);
    
    if (products.length > 0) {
      products.forEach(product => {
        console.log(`ID: ${product.id}`);
        console.log(`Nombre: ${product.name}`);
        console.log(`Categoría: ${product.category ? product.category.name : 'Sin categoría'}`);
        console.log(`Stock: ${product.stock}`);
        console.log(`Activo: ${product.isActive}`);
        console.log(`Variantes: ${product.variants.length}`);
        console.log('-------------------');
      });
    }
  } catch (error) {
    console.error('Error al activar productos:', error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());