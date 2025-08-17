import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma';

export async function GET(req: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;
    
    if (!code) {
      return NextResponse.json({ error: 'Código de barras requerido' }, { status: 400 });
    }

    log.error('🔍 Buscando producto con código de barras:', {
      original: code,
      decoded: decodeURIComponent(code),
      length: code.length,
      decodedLength: decodeURIComponent(code).length
    });

    // Limpiar y normalizar el código
    const cleanCode = decodeURIComponent(code).trim();
    
    log.error('🧹 Código limpio:', {
      cleanCode,
      length: cleanCode.length
    });

    // Buscar el producto por código de barras (búsqueda exacta)
    let product = await prisma.product.findUnique({
      where: { barcode: cleanCode },
      include: {
        category: true,
        variants: true,
      },
    });

    // Si no se encuentra, intentar búsqueda más flexible
    if (!product) {
      log.error('❌ No encontrado con búsqueda exacta, intentando búsqueda flexible...');
      
      // Buscar productos que contengan el código (búsqueda parcial)
      const products = await prisma.product.findMany({
        where: {
          barcode: {
            contains: cleanCode,
            mode: 'insensitive' // Ignorar mayúsculas/minúsculas
          }
        },
        include: {
          category: true,
          variants: true,
        },
      });

      log.error('🔍 Resultados de búsqueda flexible:', {
        count: products.length,
        barcodes: products.map(p => p.barcode)
      });

      if (products.length === 1) {
        product = products[0];
        log.error('✅ Encontrado con búsqueda flexible:', product.barcode);
      } else if (products.length > 1) {
        log.error('⚠️ Múltiples productos encontrados:', products.map(p => ({ id: p.id, name: p.name, barcode: p.barcode })));
        return NextResponse.json({ 
          error: 'Múltiples productos encontrados',
          message: `Se encontraron ${products.length} productos con códigos similares`,
          products: products.map(p => ({ id: p.id, name: p.name, barcode: p.barcode }))
        }, { status: 400 });
      }
    }

    if (!product) {
      log.error('❌ Producto no encontrado después de todas las búsquedas');
      
      // Buscar productos similares para sugerencias
      const similarProducts = await prisma.product.findMany({
        where: {
          OR: [
            { barcode: { contains: cleanCode.substring(0, Math.max(3, cleanCode.length - 2)) } },
            { name: { contains: cleanCode, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: { id: true, name: true, barcode: true }
      });

      return NextResponse.json({ 
        error: 'Producto no encontrado',
        message: `No se encontró ningún producto con el código de barras: ${cleanCode}`,
        suggestions: similarProducts.length > 0 ? similarProducts : undefined
      }, { status: 404 });
    }

    // Calcular el stock total
    let totalStock;
    if (product.variants && product.variants.length > 0) {
      // Si el producto tiene variantes, usar solo el stock de las variantes
      totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    } else {
      // Si no tiene variantes, usar el stock principal
      totalStock = product.stock;
    }

    // Verificar si el producto está disponible
    const isAvailable = totalStock > 0 && product.isActive;

    log.error('✅ Producto encontrado:', {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      barcodeLength: product.barcode?.length,
      totalStock,
      isAvailable
    });

    return NextResponse.json({
      ...product,
      totalStock,
      isAvailable,
      message: isAvailable 
        ? `Producto encontrado: ${product.name}` 
        : `Producto encontrado pero sin stock: ${product.name}`
    });

  } catch (error) {
    log.error('❌ Error al buscar producto por código de barras:', error);
    return NextResponse.json({ 
      error: 'Error al buscar el producto',
      detalle: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 