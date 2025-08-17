/**
 * Script para eliminar el producto overol duplicado
 * Uso: node scripts/remove-duplicate.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicate() {
  try {
    log.error('Eliminando producto overol duplicado...\n');
    
    // Buscar el producto overol con slug "overol" (el que tiene 1 unidad)
    const duplicateProduct = await prisma.product.findUnique({
      where: {
        slug: 'overol'
      },
      include: {
        variants: true
      }
    });
    
    if (!duplicateProduct) {
      log.error('No se encontró el producto duplicado');
      return;
    }
    
    log.error(`Producto a eliminar:`);
    log.error(`  ID: ${duplicateProduct.id}`);
    log.error(`  Nombre: ${duplicateProduct.name}`);
    log.error(`  Slug: ${duplicateProduct.slug}`);
    log.error(`  Stock principal: ${duplicateProduct.stock}`);
    log.error(`  Variantes: ${duplicateProduct.variants.length}`);
    
    if (duplicateProduct.variants.length > 0) {
      log.error(`  Stock de variantes:`);
      duplicateProduct.variants.forEach(variant => {
        log.error(`    - ${variant.color} ${variant.size}: ${variant.stock}`);
      });
    }
    
    // Verificar si tiene órdenes asociadas
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: duplicateProduct.id }
    });
    
    if (orderItems.length > 0) {
      log.error(`\n⚠️  El producto tiene ${orderItems.length} órdenes asociadas. No se puede eliminar.`);
      log.error('Considera desactivarlo en lugar de eliminarlo.');
      return;
    }
    
    // Eliminar las variantes primero
    if (duplicateProduct.variants.length > 0) {
      await prisma.productVariant.deleteMany({
        where: { productId: duplicateProduct.id }
      });
      log.error(`✅ Variantes eliminadas`);
    }
    
    // Eliminar el producto
    await prisma.product.delete({
      where: { id: duplicateProduct.id }
    });
    
    log.error(`✅ Producto duplicado eliminado exitosamente`);
    
  } catch (error) {
    log.error('Error al eliminar producto duplicado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicate(); 