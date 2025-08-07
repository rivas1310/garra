/**
 * Script para listar todos los productos con sus IDs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listProducts() {
  try {
    console.log('📋 Listando todos los productos...\n');
    
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Total de productos: ${products.length}\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Categoría: ${product.category?.name || 'Sin categoría'}`);
      console.log(`   Precio: $${product.price}`);
      console.log(`   Precio original: $${product.originalPrice || 'N/A'}`);
      console.log(`   Etiquetas: isNew=${product.isNew}, isOnSale=${product.isOnSale}, isSecondHand=${product.isSecondHand}, isActive=${product.isActive}`);
      console.log(`   Stock: ${product.stock}`);
      if (product.variants && product.variants.length > 0) {
        console.log(`   Variantes: ${product.variants.length}`);
        product.variants.forEach(variant => {
          console.log(`     - ${variant.color} ${variant.size}: ${variant.stock} unidades`);
        });
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Error al listar productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listProducts(); 