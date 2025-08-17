const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Activar todos los productos
    const result = await prisma.product.updateMany({
      where: { isActive: false },
      data: { isActive: true }
    });
    
    log.error(`Productos activados: ${result.count}`);
    
    // Verificar productos después de la actualización
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      }
    });
    
    log.error(`Productos encontrados: ${products.length}`);
    
    if (products.length > 0) {
      products.forEach(product => {
        log.error(`ID: ${product.id}`);
        log.error(`Nombre: ${product.name}`);
        log.error(`Categoría: ${product.category ? product.category.name : 'Sin categoría'}`);
        log.error(`Stock: ${product.stock}`);
        log.error(`Activo: ${product.isActive}`);
        log.error(`Variantes: ${product.variants.length}`);
        log.error('-------------------');
      });
    }
  } catch (error) {
    log.error('Error al activar productos:', error);
  }
}

main()
  .catch(e => {
    log.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());