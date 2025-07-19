import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    return NextResponse.json(productos);
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el producto', detalle: String(error) }, { status: 500 });
  }
} 