import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;
    
    if (!code) {
      return NextResponse.json({ error: 'Código de barras requerido' }, { status: 400 });
    }

    console.log('Buscando producto con código de barras:', code);

    // Buscar el producto por código de barras
    const product = await prisma.product.findUnique({
      where: { barcode: code },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ 
        error: 'Producto no encontrado',
        message: `No se encontró ningún producto con el código de barras: ${code}`
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

    console.log('Producto encontrado:', {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
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
    console.error('Error al buscar producto por código de barras:', error);
    return NextResponse.json({ 
      error: 'Error al buscar el producto',
      detalle: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 