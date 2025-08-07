const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        category: true,
      },
    });

    console.log(`Total de productos en la base de datos: ${products.length}`);

    // Mostrar detalles de cada producto
    for (const product of products) {
      console.log('-------------------');
      console.log(`ID: ${product.id}`);
      console.log(`Nombre: ${product.name}`);
      console.log(`Categoría: ${product.category?.name || 'Sin categoría'}`);
      console.log(`Stock: ${product.stock}`);
      console.log(`Activo: ${product.isActive}`);
      console.log(`Variantes: ${product.variants.length}`);
      console.log(`Fecha de creación: ${product.createdAt}`);
      console.log(`Fecha de actualización: ${product.updatedAt}`);
      console.log(`Imágenes: ${JSON.stringify(product.images)}`);
      console.log('-------------------');
    }

    // Verificar si hay algún problema con la forma en que se cargan los productos
    console.log('\nVerificando posibles problemas:');
    
    // 1. Verificar si hay productos sin categoría
    const productsWithoutCategory = products.filter(p => !p.categoryId);
    if (productsWithoutCategory.length > 0) {
      console.log(`ADVERTENCIA: ${productsWithoutCategory.length} productos sin categoría`);
      productsWithoutCategory.forEach(p => console.log(`- ${p.name} (${p.id})`));
    } else {
      console.log('✓ Todos los productos tienen categoría');
    }

    // 2. Verificar si hay productos con stock pero inactivos
    const productsWithStockButInactive = products.filter(p => {
      const variantStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
      const totalStock = p.variants.length > 0 ? variantStock : p.stock;
      return totalStock > 0 && !p.isActive;
    });
    
    if (productsWithStockButInactive.length > 0) {
      console.log(`ADVERTENCIA: ${productsWithStockButInactive.length} productos con stock pero inactivos`);
      productsWithStockButInactive.forEach(p => {
        const variantStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
        console.log(`- ${p.name} (${p.id}): Stock principal=${p.stock}, Stock variantes=${variantStock}`);
      });
    } else {
      console.log('✓ Todos los productos con stock están activos');
    }

    // 3. Verificar si hay productos activos pero sin stock
    const activeProductsWithoutStock = products.filter(p => {
      const variantStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
      const totalStock = p.variants.length > 0 ? variantStock : p.stock;
      return totalStock === 0 && p.isActive;
    });
    
    if (activeProductsWithoutStock.length > 0) {
      console.log(`ADVERTENCIA: ${activeProductsWithoutStock.length} productos activos pero sin stock`);
      activeProductsWithoutStock.forEach(p => {
        const variantStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
        console.log(`- ${p.name} (${p.id}): Stock principal=${p.stock}, Stock variantes=${variantStock}`);
      });
    } else {
      console.log('✓ No hay productos activos sin stock');
    }

  } catch (error) {
    console.error('Error al verificar productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();