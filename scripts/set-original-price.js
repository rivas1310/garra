/**
 * Script para establecer un precio original a un producto
 * Uso: node scripts/set-original-price.js <productId> <originalPrice>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setOriginalPrice(productId, originalPrice) {
  try {
    if (!productId || !originalPrice) {
      log.error('Error: Debe proporcionar productId y originalPrice.');
      log.error('Uso: node scripts/set-original-price.js <productId> <originalPrice>');
      return;
    }
    
    log.error(`Estableciendo precio original para producto ${productId}...\n`);
    
    // Buscar el producto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: true
      }
    });
    
    if (!product) {
      log.error(`Error: No se encontró el producto con ID: ${productId}`);
      return;
    }
    
    log.error(`📦 Producto: ${product.name}`);
    log.error(`💰 Precio actual: $${product.price}`);
    log.error(`💰 Precio original actual: $${product.originalPrice || 'N/A'}`);
    log.error(`🏷️ Etiquetas: isNew=${product.isNew}, isOnSale=${product.isOnSale}, isSecondHand=${product.isSecondHand}`);
    
    // Actualizar el precio original
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { originalPrice: parseFloat(originalPrice) }
    });
    
    log.error(`\n✅ Precio original actualizado exitosamente`);
    log.error(`💰 Nuevo precio original: $${updatedProduct.originalPrice}`);
    log.error(`💰 Precio actual: $${updatedProduct.price}`);
    log.error(`💰 Descuento: $${updatedProduct.originalPrice - updatedProduct.price} (${Math.round(((updatedProduct.originalPrice - updatedProduct.price) / updatedProduct.originalPrice) * 100)}%)`);
    
  } catch (error) {
    log.error('Error al establecer precio original:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener los argumentos de línea de comandos
const productId = process.argv[2];
const originalPrice = process.argv[3];
setOriginalPrice(productId, originalPrice); 