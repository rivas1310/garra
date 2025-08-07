/**
 * Script para actualizar el código de barras de un producto
 * Uso: node scripts/update-product-barcode.js <productId> <barcode>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateProductBarcode(productId, barcode) {
  try {
    if (!productId || !barcode) {
      console.error('Error: Debe proporcionar productId y barcode.');
      console.log('Uso: node scripts/update-product-barcode.js <productId> <barcode>');
      return;
    }
    
    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!existingProduct) {
      console.error(`Error: No se encontró ningún producto con el ID: ${productId}`);
      return;
    }
    
    // Verificar si el código de barras ya existe
    const existingBarcode = await prisma.product.findUnique({
      where: { barcode }
    });
    
    if (existingBarcode && existingBarcode.id !== productId) {
      console.error(`Error: El código de barras ${barcode} ya está en uso por otro producto.`);
      return;
    }
    
    // Actualizar el código de barras del producto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { barcode }
    });
    
    console.log('=========================================');
    console.log('CÓDIGO DE BARRAS ACTUALIZADO');
    console.log('=========================================');
    console.log(`Producto: ${updatedProduct.name}`);
    console.log(`ID: ${updatedProduct.id}`);
    console.log(`Código de barras: ${updatedProduct.barcode}`);
    console.log('=========================================');
    
  } catch (error) {
    console.error('Error al actualizar el código de barras:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener los argumentos de línea de comandos
const productId = process.argv[2];
const barcode = process.argv[3];
updateProductBarcode(productId, barcode); 