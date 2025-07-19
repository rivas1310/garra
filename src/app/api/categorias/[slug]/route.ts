import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const categoria = await prisma.category.findUnique({
      where: { slug },
    });
    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    const productos = await prisma.product.findMany({
      where: { categoryId: categoria.id, isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        images: true,
        rating: true,
        reviewCount: true,
        isNew: true,
        isOnSale: true,
        stock: true,
        subcategoria: true, // <-- Agregar este campo
        // Puedes agregar más campos si lo necesitas
      },
    });
    return NextResponse.json({ categoria, productos });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la categoría', detalle: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 