/**
 * Script para corregir el stock de productos con variantes
 * Uso: node scripts/fix-stock.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixStock() {
  try {
    console.log('Corrigiendo stock de productos...\n');
    
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      include: {
        variants: true
      }
    });
    
    console.log(`Encontrados ${products.length} productos\n`);
    
    for (const product of products) {
      console.log(`Producto: ${product.name}`);
      console.log(`  Stock principal antes: ${product.stock}`);
      
      // Si el producto tiene variantes, el stock principal debería ser 0
      if (product.variants && product.variants.length > 0) {
        if (product.stock !== 0) {
          console.log(`  🔧 Corrigiendo stock principal a 0...`);
          
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: 0 }
          });
          
          console.log(`  ✅ Stock principal corregido a 0`);
        } else {
          console.log(`  ✅ Stock principal ya está correcto (0)`);
        }
        
        // Mostrar stock de cada variante
        product.variants.forEach(variant => {
          console.log(`    Variante ${variant.color} ${variant.size}: ${variant.stock}`);
        });
      } else {
        console.log(`  ✅ Producto sin variantes, stock principal correcto: ${product.stock}`);
      }
      
      console.log('');
    }
    
    console.log('✅ Stock corregido exitosamente');
    
  } catch (error) {
    console.error('Error al corregir stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStock(); 