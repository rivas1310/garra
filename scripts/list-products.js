/**
 * Script para listar todos los productos con sus IDs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listProducts() {
  try {
    log.error('📋 Listando todos los productos...\n');
    
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    log.error(`📊 Total de productos: ${products.length}\n`);
    
    products.forEach((product, index) => {
      log.error(`${index + 1}. ${product.name}`);
      log.error(`   ID: ${product.id}`);
      log.error(`   Categoría: ${product.category?.name || 'Sin categoría'}`);
      log.error(`   Precio: $${product.price}`);
      log.error(`   Precio original: $${product.originalPrice || 'N/A'}`);
      log.error(`   Etiquetas: isNew=${product.isNew}, isOnSale=${product.isOnSale}, isSecondHand=${product.isSecondHand}, isActive=${product.isActive}`);
      log.error(`   Stock: ${product.stock}`);
      if (product.variants && product.variants.length > 0) {
        log.error(`   Variantes: ${product.variants.length}`);
        product.variants.forEach(variant => {
          log.error(`     - ${variant.color} ${variant.size}: ${variant.stock} unidades`);
        });
      }
      log.error('');
    });
    
  } catch (error) {
    log.error('Error al listar productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listProducts(); 