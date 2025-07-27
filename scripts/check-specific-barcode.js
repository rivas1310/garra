// Script para verificar un código de barras específico en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBarcode() {
  try {
    const barcode = 'PRD840241851676';
    console.log(`Buscando producto con código de barras: ${barcode}`);
    
    // Búsqueda exacta
    const exactProduct = await prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        variants: true,
      },
    });
    
    if (exactProduct) {
      console.log('✅ Producto encontrado con búsqueda exacta:');
      console.log({
        id: exactProduct.id,
        name: exactProduct.name,
        barcode: exactProduct.barcode,
        barcodeLength: exactProduct.barcode?.length,
        stock: exactProduct.stock,
        isActive: exactProduct.isActive,
        variants: exactProduct.variants.length
      });
      return;
    }
    
    console.log('❌ No encontrado con búsqueda exacta, intentando búsqueda flexible...');
    
    // Búsqueda flexible
    const flexibleProducts = await prisma.product.findMany({
      where: {
        barcode: {
          contains: barcode,
          mode: 'insensitive'
        }
      },
      include: {
        category: true,
        variants: true,
      },
    });
    
    if (flexibleProducts.length > 0) {
      console.log(`✅ Se encontraron ${flexibleProducts.length} productos con búsqueda flexible:`);
      flexibleProducts.forEach(product => {
        console.log({
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          barcodeLength: product.barcode?.length,
          stock: product.stock,
          isActive: product.isActive,
          variants: product.variants.length
        });
      });
      return;
    }
    
    console.log('❌ No se encontró ningún producto con el código de barras especificado');
    
    // Buscar productos con códigos de barras similares
    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          { barcode: { contains: barcode.substring(0, Math.max(3, barcode.length - 2)) } },
          { barcode: { contains: barcode.substring(barcode.length - Math.max(3, barcode.length - 2)) } }
        ]
      },
      select: { id: true, name: true, barcode: true }
    });
    
    if (similarProducts.length > 0) {
      console.log('💡 Productos con códigos de barras similares:');
      similarProducts.forEach(product => {
        console.log({
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          similarity: product.barcode ? calculateSimilarity(barcode, product.barcode) : 0
        });
      });
    } else {
      console.log('❌ No se encontraron productos con códigos de barras similares');
    }
    
    // Verificar si hay algún producto con ID o slug igual al código de barras
    const productByIdOrSlug = await prisma.product.findFirst({
      where: {
        OR: [
          { id: barcode },
          { slug: barcode }
        ]
      }
    });
    
    if (productByIdOrSlug) {
      console.log('⚠️ Se encontró un producto con ID o slug igual al código de barras:');
      console.log({
        id: productByIdOrSlug.id,
        name: productByIdOrSlug.name,
        slug: productByIdOrSlug.slug,
        barcode: productByIdOrSlug.barcode
      });
    }
    
  } catch (error) {
    console.error('Error al verificar el código de barras:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para calcular la similitud entre dos cadenas
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  return (longer.length - levenshteinDistance(longer, shorter)) / longer.length;
}

// Algoritmo de distancia de Levenshtein
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  // Inicializar matriz
  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }
  
  // Rellenar matriz
  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // eliminación
        matrix[i][j - 1] + 1,      // inserción
        matrix[i - 1][j - 1] + cost // sustitución
      );
    }
  }
  
  return matrix[str1.length][str2.length];
}

checkBarcode();