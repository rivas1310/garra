import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('POST /api/productos recibido:', data);
    const {
      name,
      description,
      categoryId,
      price,
      originalPrice,
      images,
      stock,
      barcode, // Necesario para el código de barras
      isActive,
      isNew,
      isOnSale,
      isSecondHand,
      variants = [],
    } = data;

    // Generar slug base
    let baseSlug = name.toLowerCase().replace(/\s+/g, '-');
    let slug = baseSlug;
    let count = 1;
    // Buscar si el slug ya existe y generar uno único
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    // Crear el producto principal
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        images,
        categoryId,
        stock: parseInt(stock),
        // barcode: barcode || null, // Incluir código de barras - Temporalmente comentado hasta regenerar Prisma client
        isActive,
        isNew,
        isOnSale,
        isSecondHand: !!isSecondHand,
        variants: {
          create: variants.map((variant: any) => ({
            size: variant.size,
            color: variant.color,
            stock: parseInt(variant.stock),
            price: variant.price ? parseFloat(variant.price) : null,
          })),
        },
      },
      include: { variants: true },
    });

    // Si se proporcionó un código de barras, actualizarlo usando SQL directo
    if (barcode) {
      try {
        await prisma.$executeRaw`UPDATE "Product" SET barcode = ${barcode} WHERE id = ${product.id}`;
        console.log(`Código de barras ${barcode} agregado al producto ${product.id}`);
      } catch (error) {
        console.error('Error al agregar código de barras:', error);
        // No fallar la creación del producto si el código de barras falla
      }
    }

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    let detalle = typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error);
    return NextResponse.json({ error: 'Error al crear el producto', detalle }, { status: 500 });
  }
}

export async function GET() {
  try {
    const productos = await prisma.product.findMany({
      include: {
        variants: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Calcular el totalStock para cada producto
    const productosConTotalStock = productos.map(producto => {
      let totalStock;
      if (producto.variants && producto.variants.length > 0) {
        // Si el producto tiene variantes, usar solo el stock de las variantes
        totalStock = producto.variants.reduce((sum, v) => sum + v.stock, 0);
      } else {
        // Si no tiene variantes, usar el stock principal
        totalStock = producto.stock;
      }
      
      return {
        ...producto,
        totalStock
      };
    });
    
    return NextResponse.json(productosConTotalStock);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }
    
    // Verificar si el producto está asociado a alguna orden
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: id },
    });
    
    if (orderItems.length > 0) {
      return NextResponse.json({
        error: 'No se puede eliminar el producto',
        detalle: 'El producto está asociado a una o más órdenes. Considere desactivarlo en lugar de eliminarlo.',
        orderCount: orderItems.length
      }, { status: 409 }); // Conflict status code
    }
    
    // Primero eliminar las variantes asociadas al producto
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });
    
    // Luego eliminar el producto
    await prisma.product.delete({ where: { id } });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    let detalle = typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error);
    return NextResponse.json({ error: 'Error al eliminar el producto', detalle }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { id, isActive, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }
    
    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    
    // Actualizar el producto
    const updatePayload: Prisma.ProductUpdateInput = {};
    
    // Si se proporciona isActive, actualizarlo
    if (typeof isActive === 'boolean') {
      updatePayload.isActive = isActive;
    }
    
    // Agregar otros campos de actualización si se proporcionan
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        // Usar una aserción de tipo para evitar el error de indexación
        (updatePayload as any)[key] = updateData[key];
      }
    });
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updatePayload,
      include: { variants: true, category: true },
    });
    
    return NextResponse.json({ ok: true, product: updatedProduct });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    let detalle = typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error);
    return NextResponse.json({ error: 'Error al actualizar el producto', detalle }, { status: 500 });
  }
}