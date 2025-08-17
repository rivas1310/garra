// Script para corregir el error tipográfico en subcategorías
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSubcategoryTypo() {
  try {
    console.log('🔧 Iniciando corrección de errores tipográficos en subcategorías...\n');

    // Buscar productos con "pnatalones" (error tipográfico)
    const productsWithTypo = await prisma.product.findMany({
      where: {
        subcategoria: 'pnatalones'
      },
      select: {
        id: true,
        name: true,
        subcategoria: true
      }
    });

    console.log(`📊 Productos encontrados con "pnatalones": ${productsWithTypo.length}`);
    
    if (productsWithTypo.length > 0) {
      console.log('\n📋 Productos a corregir:');
      productsWithTypo.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });

      // Corregir el error tipográfico
      const updateResult = await prisma.product.updateMany({
        where: {
          subcategoria: 'pnatalones'
        },
        data: {
          subcategoria: 'Pantalones'
        }
      });

      console.log(`\n✅ Productos actualizados: ${updateResult.count}`);
      console.log('✅ "pnatalones" → "Pantalones"');
    } else {
      console.log('✅ No se encontraron productos con el error tipográfico.');
    }

    // Buscar productos con "pantalones" (minúscula) para normalizar
    const productsLowercase = await prisma.product.findMany({
      where: {
        subcategoria: 'pantalones'
      },
      select: {
        id: true,
        name: true,
        subcategoria: true
      }
    });

    console.log(`\n📊 Productos encontrados con "pantalones" (minúscula): ${productsLowercase.length}`);
    
    if (productsLowercase.length > 0) {
      console.log('\n📋 Productos a normalizar:');
      productsLowercase.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });

      // Normalizar a formato correcto
      const normalizeResult = await prisma.product.updateMany({
        where: {
          subcategoria: 'pantalones'
        },
        data: {
          subcategoria: 'Pantalones'
        }
      });

      console.log(`\n✅ Productos normalizados: ${normalizeResult.count}`);
      console.log('✅ "pantalones" → "Pantalones"');
    } else {
      console.log('✅ No se encontraron productos con subcategoría en minúscula.');
    }

    // Buscar productos con "sueter" para normalizar
    const productsSueter = await prisma.product.findMany({
      where: {
        subcategoria: 'sueter'
      },
      select: {
        id: true,
        name: true,
        subcategoria: true
      }
    });

    console.log(`\n📊 Productos encontrados con "sueter": ${productsSueter.length}`);
    
    if (productsSueter.length > 0) {
      console.log('\n📋 Productos a normalizar:');
      productsSueter.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });

      // Normalizar a formato correcto
      const sueterResult = await prisma.product.updateMany({
        where: {
          subcategoria: 'sueter'
        },
        data: {
          subcategoria: 'Suéter'
        }
      });

      console.log(`\n✅ Productos normalizados: ${sueterResult.count}`);
      console.log('✅ "sueter" → "Suéter"');
    } else {
      console.log('✅ No se encontraron productos con "sueter".');
    }

    // Verificar el estado final
    console.log('\n🔍 Verificando estado final...');
    
    const finalSubcategories = await prisma.product.findMany({
      where: {
        isActive: true,
        subcategoria: { not: null }
      },
      select: {
        subcategoria: true
      },
      distinct: ['subcategoria']
    });

    const uniqueSubcategories = finalSubcategories
      .map(item => item.subcategoria)
      .filter(Boolean)
      .sort();

    console.log('\n📋 Subcategorías únicas después de la corrección:');
    uniqueSubcategories.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub}`);
    });

    console.log(`\n🎉 Corrección completada. Total de subcategorías únicas: ${uniqueSubcategories.length}`);

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  fixSubcategoryTypo();
}

module.exports = { fixSubcategoryTypo };
