const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBarcodes() {
  try {
    console.log('🔍 Verificando códigos de barras en la base de datos...\n');

    // Obtener todos los productos con códigos de barras
    const products = await prisma.product.findMany({
      where: {
        barcode: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        barcode: true,
        stock: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Total de productos con códigos de barras: ${products.length}\n`);

    if (products.length === 0) {
      console.log('❌ No hay productos con códigos de barras en la base de datos.');
      console.log('💡 Sugerencia: Agrega códigos de barras a los productos desde el panel de administración.');
      return;
    }

    // Mostrar productos con códigos de barras
    console.log('📋 Productos con códigos de barras:');
    console.log('─'.repeat(80));
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Código: "${product.barcode}" (${product.barcode.length} caracteres)`);
      console.log(`   Stock: ${product.stock} | Activo: ${product.isActive ? 'Sí' : 'No'}`);
      console.log('');
    });

    // Verificar códigos duplicados
    const barcodeCounts = {};
    products.forEach(product => {
      if (product.barcode) {
        barcodeCounts[product.barcode] = (barcodeCounts[product.barcode] || 0) + 1;
      }
    });

    const duplicates = Object.entries(barcodeCounts).filter(([barcode, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log('⚠️  CÓDIGOS DUPLICADOS ENCONTRADOS:');
      console.log('─'.repeat(80));
      duplicates.forEach(([barcode, count]) => {
        console.log(`Código "${barcode}" aparece ${count} veces`);
        const duplicateProducts = products.filter(p => p.barcode === barcode);
        duplicateProducts.forEach(product => {
          console.log(`  - ${product.name} (ID: ${product.id})`);
        });
        console.log('');
      });
    } else {
      console.log('✅ No se encontraron códigos de barras duplicados.');
    }

    // Verificar códigos vacíos o muy cortos
    const invalidBarcodes = products.filter(product => 
      !product.barcode || 
      product.barcode.trim().length < 3 ||
      product.barcode.trim().length > 50
    );

    if (invalidBarcodes.length > 0) {
      console.log('⚠️  CÓDIGOS DE BARRAS INVÁLIDOS:');
      console.log('─'.repeat(80));
      invalidBarcodes.forEach(product => {
        console.log(`- ${product.name}: "${product.barcode}" (${product.barcode?.length || 0} caracteres)`);
      });
      console.log('');
    }

    // Estadísticas
    const activeProducts = products.filter(p => p.isActive);
    const productsWithStock = products.filter(p => p.stock > 0);
    
    console.log('📈 ESTADÍSTICAS:');
    console.log('─'.repeat(80));
    console.log(`Total productos con códigos: ${products.length}`);
    console.log(`Productos activos: ${activeProducts.length}`);
    console.log(`Productos con stock: ${productsWithStock.length}`);
    console.log(`Códigos duplicados: ${duplicates.length}`);
    console.log(`Códigos inválidos: ${invalidBarcodes.length}`);

    // Sugerencias
    console.log('\n💡 SUGERENCIAS:');
    console.log('─'.repeat(80));
    
    if (duplicates.length > 0) {
      console.log('• Corrige los códigos de barras duplicados para evitar conflictos');
    }
    
    if (invalidBarcodes.length > 0) {
      console.log('• Revisa y corrige los códigos de barras inválidos');
    }
    
    if (products.length < 10) {
      console.log('• Considera agregar más códigos de barras para mejorar la funcionalidad del escáner');
    }
    
    console.log('• Los códigos de barras deben tener entre 3 y 50 caracteres');
    console.log('• Cada producto debe tener un código único');

  } catch (error) {
    console.error('❌ Error al verificar códigos de barras:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
checkBarcodes(); 