/**
 * Script para eliminar el producto overol duplicado
 * Uso: node scripts/remove-duplicate.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicate() {
  try {
    console.log('Eliminando producto overol duplicado...\n');
    
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
      console.log('No se encontró el producto duplicado');
      return;
    }
    
    console.log(`Producto a eliminar:`);
    console.log(`  ID: ${duplicateProduct.id}`);
    console.log(`  Nombre: ${duplicateProduct.name}`);
    console.log(`  Slug: ${duplicateProduct.slug}`);
    console.log(`  Stock principal: ${duplicateProduct.stock}`);
    console.log(`  Variantes: ${duplicateProduct.variants.length}`);
    
    if (duplicateProduct.variants.length > 0) {
      console.log(`  Stock de variantes:`);
      duplicateProduct.variants.forEach(variant => {
        console.log(`    - ${variant.color} ${variant.size}: ${variant.stock}`);
      });
    }
    
    // Verificar si tiene órdenes asociadas
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: duplicateProduct.id }
    });
    
    if (orderItems.length > 0) {
      console.log(`\n⚠️  El producto tiene ${orderItems.length} órdenes asociadas. No se puede eliminar.`);
      console.log('Considera desactivarlo en lugar de eliminarlo.');
      return;
    }
    
    // Eliminar las variantes primero
    if (duplicateProduct.variants.length > 0) {
      await prisma.productVariant.deleteMany({
        where: { productId: duplicateProduct.id }
      });
      console.log(`✅ Variantes eliminadas`);
    }
    
    // Eliminar el producto
    await prisma.product.delete({
      where: { id: duplicateProduct.id }
    });
    
    console.log(`✅ Producto duplicado eliminado exitosamente`);
    
  } catch (error) {
    console.error('Error al eliminar producto duplicado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicate(); 