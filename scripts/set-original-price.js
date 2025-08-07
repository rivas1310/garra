/**
 * Script para establecer un precio original a un producto
 * Uso: node scripts/set-original-price.js <productId> <originalPrice>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setOriginalPrice(productId, originalPrice) {
  try {
    if (!productId || !originalPrice) {
      console.error('Error: Debe proporcionar productId y originalPrice.');
      console.log('Uso: node scripts/set-original-price.js <productId> <originalPrice>');
      return;
    }
    
    console.log(`Estableciendo precio original para producto ${productId}...\n`);
    
    // Buscar el producto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: true
      }
    });
    
    if (!product) {
      console.error(`Error: No se encontró el producto con ID: ${productId}`);
      return;
    }
    
    console.log(`📦 Producto: ${product.name}`);
    console.log(`💰 Precio actual: $${product.price}`);
    console.log(`💰 Precio original actual: $${product.originalPrice || 'N/A'}`);
    console.log(`🏷️ Etiquetas: isNew=${product.isNew}, isOnSale=${product.isOnSale}, isSecondHand=${product.isSecondHand}`);
    
    // Actualizar el precio original
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { originalPrice: parseFloat(originalPrice) }
    });
    
    console.log(`\n✅ Precio original actualizado exitosamente`);
    console.log(`💰 Nuevo precio original: $${updatedProduct.originalPrice}`);
    console.log(`💰 Precio actual: $${updatedProduct.price}`);
    console.log(`💰 Descuento: $${updatedProduct.originalPrice - updatedProduct.price} (${Math.round(((updatedProduct.originalPrice - updatedProduct.price) / updatedProduct.originalPrice) * 100)}%)`);
    
  } catch (error) {
    console.error('Error al establecer precio original:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener los argumentos de línea de comandos
const productId = process.argv[2];
const originalPrice = process.argv[3];
setOriginalPrice(productId, originalPrice); 