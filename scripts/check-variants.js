/**
 * Script para verificar las variantes de los productos overol
 * Uso: node scripts/check-variants.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVariants() {
  try {
    console.log('Verificando variantes de productos overol...\n');
    
    // Buscar productos con nombre "overol"
    const overolProducts = await prisma.product.findMany({
      where: {
        name: {
          contains: 'overol',
          mode: 'insensitive'
        }
      },
      include: {
        variants: true,
        category: true
      }
    });
    
    console.log(`Encontrados ${overolProducts.length} productos overol:\n`);
    
    overolProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Categoría: ${product.category?.name}`);
      console.log(`   Precio: $${product.price}`);
      console.log(`   Stock principal: ${product.stock}`);
      console.log(`   Activo: ${product.isActive ? 'Sí' : 'No'}`);
      console.log(`   Creado: ${product.createdAt.toLocaleDateString()}`);
      
      if (product.variants && product.variants.length > 0) {
        console.log(`   Variantes:`);
        product.variants.forEach(variant => {
          console.log(`     - ${variant.color} ${variant.size}: ${variant.stock} unidades`);
        });
      } else {
        console.log(`   Sin variantes`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('Error al verificar variantes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVariants(); 