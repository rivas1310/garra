/**
 * Script para restaurar el stock que se había reservado
 * Uso: node scripts/restore-stock.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreStock() {
  try {
    console.log('Restaurando stock de productos...\n');
    
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      include: {
        variants: true
      }
    });
    
    console.log(`Encontrados ${products.length} productos\n`);
    
    for (const product of products) {
      console.log(`Producto: ${product.name}`);
      console.log(`  Stock actual: ${product.stock}`);
      
      // Calcular el stock total de las variantes
      let totalVariantStock = 0;
      if (product.variants && product.variants.length > 0) {
        totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
        console.log(`  Stock total de variantes: ${totalVariantStock}`);
        
        // Mostrar stock de cada variante
        product.variants.forEach(variant => {
          console.log(`    Variante ${variant.color} ${variant.size}: ${variant.stock}`);
        });
      }
      
      // Si el producto tiene variantes, el stock principal debería ser 0
      // Si no tiene variantes, el stock principal debería ser el stock real
      if (product.variants && product.variants.length > 0) {
        if (product.stock !== 0) {
          console.log(`  ⚠️  Producto con variantes pero stock principal no es 0`);
        }
      } else {
        console.log(`  Stock principal: ${product.stock}`);
      }
      
      console.log('');
    }
    
    console.log('Stock verificado. Si necesitas restaurar stock específico, edita este script.');
    
  } catch (error) {
    console.error('Error al verificar stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreStock(); 