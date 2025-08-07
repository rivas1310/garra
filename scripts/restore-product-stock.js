/**
 * Script para restaurar el stock de un producto
 * Uso: node scripts/restore-product-stock.js <productId> <stockAmount>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreProductStock(productId, stockAmount) {
  try {
    if (!productId || stockAmount === undefined) {
      console.error('Error: Debe proporcionar productId y stockAmount.');
      console.log('Uso: node scripts/restore-product-stock.js <productId> <stockAmount>');
      return;
    }
    
    console.log(`Restaurando stock para producto ${productId}, cantidad: ${stockAmount}\n`);
    
    // Verificar si el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true
      }
    });
    
    if (!product) {
      console.error(`Error: No se encontró el producto con ID: ${productId}`);
      return;
    }
    
    console.log(`Producto: ${product.name}`);
    console.log(`Stock principal actual: ${product.stock}`);
    console.log(`Activo: ${product.isActive ? 'Sí' : 'No'}`);
    
    if (product.variants && product.variants.length > 0) {
      console.log('Variantes actuales:');
      product.variants.forEach(variant => {
        console.log(`  - ${variant.color} ${variant.size}: ${variant.stock} unidades`);
      });
      
      // Restaurar stock de la primera variante
      const firstVariant = product.variants[0];
      const updatedVariant = await prisma.productVariant.update({
        where: { id: firstVariant.id },
        data: { stock: stockAmount }
      });
      
      console.log(`\n✅ Stock de variante restaurado: ${firstVariant.color} ${firstVariant.size} = ${updatedVariant.stock} unidades`);
      
      // Reactivar el producto si estaba desactivado
      if (!product.isActive) {
        await prisma.product.update({
          where: { id: productId },
          data: { isActive: true }
        });
        console.log(`✅ Producto reactivado`);
      }
      
    } else {
      // Restaurar stock principal del producto
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { 
          stock: stockAmount,
          isActive: true
        }
      });
      
      console.log(`\n✅ Stock principal restaurado: ${updatedProduct.stock} unidades`);
      console.log(`✅ Producto reactivado`);
    }
    
    console.log('\n✅ Stock restaurado exitosamente');
    
  } catch (error) {
    console.error('Error al restaurar stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener los argumentos de línea de comandos
const productId = process.argv[2];
const stockAmount = parseInt(process.argv[3]);
restoreProductStock(productId, stockAmount); 