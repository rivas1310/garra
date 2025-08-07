/**
 * Script para verificar el estado de los productos
 * Uso: node scripts/check-products.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('Verificando productos en la base de datos...\n');
    
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (products.length === 0) {
      console.log('No hay productos en la base de datos.');
      return;
    }
    
    console.log(`Total de productos encontrados: ${products.length}\n`);
    
    // Mostrar información de cada producto
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Categoría: ${product.category?.name || 'Sin categoría'}`);
      console.log(`   Precio: $${product.price}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Activo: ${product.isActive ? '✅ Sí' : '❌ No'}`);
      console.log(`   Nuevo: ${product.isNew ? '✅ Sí' : '❌ No'}`);
      console.log(`   En oferta: ${product.isOnSale ? '✅ Sí' : '❌ No'}`);
      console.log(`   Segunda mano: ${product.isSecondHand ? '✅ Sí' : '❌ No'}`);
      console.log(`   Variantes: ${product.variants.length}`);
      console.log(`   Creado: ${product.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
    // Estadísticas
    const activeProducts = products.filter(p => p.isActive);
    const inactiveProducts = products.filter(p => !p.isActive);
    const productsWithStock = products.filter(p => p.stock > 0);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    
    console.log('=== ESTADÍSTICAS ===');
    console.log(`Productos activos: ${activeProducts.length}`);
    console.log(`Productos inactivos: ${inactiveProducts.length}`);
    console.log(`Productos con stock: ${productsWithStock.length}`);
    console.log(`Productos sin stock: ${outOfStockProducts.length}`);
    
    // Si hay productos inactivos, mostrar opciones
    if (inactiveProducts.length > 0) {
      console.log('\n=== PRODUCTOS INACTIVOS ===');
      inactiveProducts.forEach(product => {
        console.log(`- ${product.name} (${product.id})`);
      });
      
      console.log('\nPara activar un producto, ejecuta:');
      console.log('node scripts/activate-products.js');
    }
    
  } catch (error) {
    console.error('Error al verificar productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();