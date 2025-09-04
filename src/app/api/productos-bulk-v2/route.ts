import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateUniqueEAN13 } from '@/lib/barcodeUtils';

// Crear una nueva instancia de Prisma directamente
const prisma = new PrismaClient();

interface BulkProduct {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  subcategory?: string;
  imageUrl: string;
  barcode?: string;
  conditionTag?: 'LIKE_NEW' | 'PRE_LOVED' | 'GENTLY_USED' | 'VINTAGE' | 'RETRO' | 'UPCYCLED' | 'REWORKED' | 'DEADSTOCK' | 'OUTLET_OVERSTOCK' | 'REPURPOSED' | 'NEARLY_NEW' | 'DESIGNER_RESALE' | 'SUSTAINABLE_FASHION' | 'THRIFTED' | 'CIRCULAR_FASHION';
}

export async function POST(request: NextRequest) {
  try {
    // Debug: Verificar Prisma al inicio de la función
    console.log('=== DEBUG PRISMA V2 ===');
    console.log('Prisma client:', typeof prisma);
    console.log('Prisma client disponible:', !!prisma);
    console.log('Prisma client keys:', prisma ? Object.keys(prisma) : 'NO DISPONIBLE');
    
    const body = await request.json();
    const { productos } = body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron productos válidos' },
        { status: 400 }
      );
    }

    console.log(`Iniciando creación masiva de ${productos.length} productos`);

    const createdProducts = [];
    const errors = [];

    // Crear cada producto individualmente
    for (let i = 0; i < productos.length; i++) {
      const productData = productos[i] as BulkProduct;
      
      try {
        console.log(`Creando producto ${i + 1}/${productos.length}: ${productData.name}`);
        
        // Buscar o crear categoría
        let category = await prisma.category.findFirst({
          where: { name: { equals: productData.category, mode: 'insensitive' } }
        });

        if (!category) {
          console.log(`Creando nueva categoría: ${productData.category}`);
          category = await prisma.category.create({
            data: {
              name: productData.category,
              slug: productData.category.toLowerCase().replace(/\s+/g, '-'),
              description: `Categoría: ${productData.category}`
            }
          });
        }

        // Validar y normalizar subcategoría
        let normalizedSubcategory = null;
        if (productData.subcategory) {
          // Normalizar el texto de subcategoría
          normalizedSubcategory = productData.subcategory
            .trim()
            .toLowerCase()
            .replace(/^\w/, c => c.toUpperCase()); // Primera letra mayúscula
          
          console.log(`Subcategoría normalizada: ${normalizedSubcategory}`);
        } else {
          console.log('Sin subcategoría especificada');
        }

        // Generar código de barras si no existe
        let barcode = productData.barcode;
        if (!barcode) {
          barcode = generateUniqueEAN13();
        }

        // Generar slug para el producto
        const slug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
          .replace(/\s+/g, '-') // Reemplazar espacios con guiones
          .trim();

        // Crear el producto
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            slug: slug,
            description: productData.description || `Descripción de ${productData.name}`,
            price: productData.price,
            stock: productData.stock,
            categoryId: category.id,
            subcategoria: normalizedSubcategory, // Usar subcategoría normalizada
            images: [productData.imageUrl], // Campo images como array
            barcode: barcode,
            conditionTag: productData.conditionTag || 'LIKE_NEW',
            isActive: true
          }
        });

        createdProducts.push({
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          success: true
        });

        console.log(`Producto ${productData.name} creado exitosamente con ID: ${product.id}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error creando producto ${productData.name}:`, errorMessage);
        
        errors.push({
          name: productData.name,
          error: errorMessage,
          success: false
        });
      }
    }

    const successCount = createdProducts.length;
    const errorCount = errors.length;
    
    // Debug: Log detallado de resultados
    console.log('=== RESUMEN DE CREACIÓN V2 ===');
    console.log(`Total recibido: ${productos.length}`);
    console.log(`Productos creados exitosamente: ${successCount}`);
    console.log(`Productos con errores: ${errorCount}`);
    console.log('Productos creados:', createdProducts);
    console.log('Errores encontrados:', errors);

    console.log(`Creación masiva completada: ${successCount} exitosas, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      results: {
        total: productos.length,
        successful: successCount,
        failed: errorCount,
        created: createdProducts,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Error en creación masiva de productos V2:', error);
    return NextResponse.json(
      {
        error: 'Error en creación masiva de productos V2',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
