/**
 * Script para verificar las imágenes de un producto
 * Uso: node scripts/check-product-images.js <productId>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProductImages(productId) {
  try {
    if (!productId) {
      console.error('Error: Debe proporcionar un productId.');
      console.log('Uso: node scripts/check-product-images.js <productId>');
      return;
    }
    
    console.log(`Verificando imágenes del producto ${productId}...\n`);
    
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
    console.log(`🏷️ Categoría: ${product.category?.name || 'Sin categoría'}`);
    console.log(`💰 Precio: $${product.price}`);
    console.log(`📅 Creado: ${product.createdAt}`);
    
    console.log('\n🖼️ IMÁGENES:');
    if (product.images && Array.isArray(product.images)) {
      console.log(`  - Total de imágenes: ${product.images.length}`);
      product.images.forEach((image, index) => {
        console.log(`  - Imagen ${index + 1}: ${image}`);
      });
      
      if (product.images.length > 0) {
        console.log(`\n✅ Primera imagen disponible: ${product.images[0]}`);
      } else {
        console.log('\n❌ No hay imágenes disponibles');
      }
    } else {
      console.log('  - No hay imágenes configuradas');
    }
    
    console.log('\n🎯 IMAGEN QUE SE USARÁ EN EL COMPONENTE:');
    const imageToUse = Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png';
    console.log(`  - ${imageToUse}`);
    
    console.log('\n📊 STOCK:');
    console.log(`  - Stock principal: ${product.stock}`);
    if (product.variants && product.variants.length > 0) {
      console.log('  - Variantes:');
      product.variants.forEach(variant => {
        console.log(`    * ${variant.color} ${variant.size}: ${variant.stock} unidades`);
      });
    }
    
  } catch (error) {
    console.error('Error al verificar imágenes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener el argumento de línea de comandos
const productId = process.argv[2];
checkProductImages(productId); 