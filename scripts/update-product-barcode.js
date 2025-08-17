/**
 * Script para actualizar el código de barras de un producto
 * Uso: node scripts/update-product-barcode.js <productId> <barcode>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateProductBarcode(productId, barcode) {
  try {
    if (!productId || !barcode) {
      log.error('Error: Debe proporcionar productId y barcode.');
      log.error('Uso: node scripts/update-product-barcode.js <productId> <barcode>');
      return;
    }
    
    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!existingProduct) {
      log.error(`Error: No se encontró ningún producto con el ID: ${productId}`);
      return;
    }
    
    // Verificar si el código de barras ya existe
    const existingBarcode = await prisma.product.findUnique({
      where: { barcode }
    });
    
    if (existingBarcode && existingBarcode.id !== productId) {
      log.error(`Error: El código de barras ${barcode} ya está en uso por otro producto.`);
      return;
    }
    
    // Actualizar el código de barras del producto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { barcode }
    });
    
    log.error('=========================================');
    log.error('CÓDIGO DE BARRAS ACTUALIZADO');
    log.error('=========================================');
    log.error(`Producto: ${updatedProduct.name}`);
    log.error(`ID: ${updatedProduct.id}`);
    log.error(`Código de barras: ${updatedProduct.barcode}`);
    log.error('=========================================');
    
  } catch (error) {
    log.error('Error al actualizar el código de barras:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener los argumentos de línea de comandos
const productId = process.argv[2];
const barcode = process.argv[3];
updateProductBarcode(productId, barcode); 