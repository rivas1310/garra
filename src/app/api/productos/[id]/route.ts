import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma';
import { updateProductStock, isProductAvailable } from '@/lib/productUtils';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // Verificar si hay un parámetro de timestamp para evitar caché
    const url = new URL(req.url);
    const timestamp = url.searchParams.get('t');
    if (timestamp) {
      log.error(`Solicitud de producto ${id} con timestamp ${timestamp} para evitar caché`);
    }
    
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

    // Calcular el stock total correctamente
    let totalStock;
    if (product.variants && product.variants.length > 0) {
      // Si el producto tiene variantes, usar solo el stock de las variantes
      // sin sumar el stock principal para evitar duplicación
      totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    } else {
      // Si no tiene variantes, usar el stock principal
      totalStock = product.stock;
    }
    
    let isAvailable = false;
    try {
      // Verificar si el producto está disponible usando la función actualizada
      isAvailable = await isProductAvailable(id);
    } catch (updateError) {
      log.error('Error al verificar disponibilidad del producto:', updateError);
      // Continuar con la respuesta aunque falle la verificación
    }
    
    // Configurar headers para evitar caché
    const headers = new Headers();
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return NextResponse.json({ 
      ...product, 
      isAvailable,
      calculatedStock: totalStock // Enviamos como calculatedStock en lugar de totalStock
    }, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el producto', detalle: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    log.error('PUT /api/productos/[id] recibido:', { id, data });
    const {
      name,
      description,
      categoryId,
      subcategoria,
      price,
      originalPrice,
      images,
      stock,
      barcode,
      isActive,
      conditionTag,
      isOnSale,
      variants = [],
    } = data;

    // Obtener el producto actual para verificar si el nombre cambió
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true
      }
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

    // Primero, eliminar todas las variantes existentes
    await prisma.productVariant.deleteMany({
      where: { productId: id }
    });

    // Luego, crear las nuevas variantes
    if (variants && variants.length > 0) {
      log.error('Creando variantes:', variants);
      await prisma.productVariant.createMany({
        data: variants.map((variant: any) => ({
          productId: id,
          size: variant.size,
          color: variant.color,
          stock: parseInt(variant.stock),
          price: variant.price ? parseFloat(variant.price) : null,
        })),
      });
    }

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
        // barcode: barcode || null, // Incluir código de barras - Temporalmente comentado hasta regenerar Prisma client
        conditionTag,
        isOnSale,
        // isActive se maneja automáticamente en updateProductStock
      },
      include: {
        variants: true,
        category: true,
      },
    });

    // Si se proporcionó un código de barras, actualizarlo usando SQL directo
    if (barcode) {
      try {
        await prisma.$executeRaw`UPDATE "Product" SET barcode = ${barcode} WHERE id = ${id}`;
        log.error(`Código de barras ${barcode} actualizado para el producto ${id}`);
      } catch (error) {
        log.error('Error al actualizar código de barras:', error);
        // No fallar la actualización del producto si el código de barras falla
      }
    }

    return NextResponse.json({ 
      ok: true, 
      product: finalUpdated,
      message: stockValue === 0 ? 'Producto desactivado automáticamente por falta de stock' : 'Producto actualizado correctamente'
    });
  } catch (error) {
    log.error('Error en PUT /api/productos/[id]:', error);
    return NextResponse.json({ error: 'Error al actualizar el producto', detalle: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}