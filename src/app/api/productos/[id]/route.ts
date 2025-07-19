import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateProductStock, isProductAvailable } from '@/lib/productUtils';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Verificar si el producto está disponible
    const isAvailable = await isProductAvailable(id);
    
    return NextResponse.json({ 
      ...product, 
      isAvailable,
      // Incluir información de stock total
      totalStock: product.stock + product.variants.reduce((sum, v) => sum + v.stock, 0)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el producto', detalle: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    console.log('PUT /api/productos/[id] recibido:', { id, data });
    const {
      name,
      description,
      categoryId,
      subcategoria,
      price,
      originalPrice,
      images,
      stock,
      isActive,
      isNew,
      isOnSale,
      isSecondHand,
      variants = [],
    } = data;

    // Obtener el producto actual para verificar si el nombre cambió
    const currentProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!currentProduct) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Generar nuevo slug solo si el nombre cambió
    let newSlug = currentProduct.slug;
    if (currentProduct.name !== name) {
      let baseSlug = name.toLowerCase().replace(/\s+/g, '-');
      newSlug = baseSlug;
      let count = 1;
      // Buscar si el slug ya existe y generar uno único (excluyendo el producto actual)
      while (await prisma.product.findFirst({ 
        where: { 
          slug: newSlug,
          id: { not: id }
        } 
      })) {
        newSlug = `${baseSlug}-${count}`;
        count++;
      }
    }

    const stockValue = parseInt(stock);
    
    // Usar la función de utilidad para actualizar el stock y estado activo
    const updated = await updateProductStock(id, stockValue);

    // Actualizar el resto de los campos
    const finalUpdated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: newSlug,
        description,
        categoryId,
        subcategoria,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        images,
        isNew,
        isOnSale,
        isSecondHand: !!isSecondHand,
        // isActive se maneja automáticamente en updateProductStock
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ 
      ok: true, 
      product: finalUpdated,
      message: stockValue === 0 ? 'Producto desactivado automáticamente por falta de stock' : 'Producto actualizado correctamente'
    });
  } catch (error) {
    console.error('Error en PUT /api/productos/[id]:', error);
    return NextResponse.json({ error: 'Error al actualizar el producto', detalle: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 