import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma';

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  // Obtener parámetros de la URL
  const { searchParams } = new URL(req.url);
  // Verificar si hay un parámetro de timestamp (para evitar caché)
  const timestamp = searchParams.get('t');
  
  log.error(`API /categorias/${slug}: Obteniendo categoría y productos. Timestamp: ${timestamp || 'no proporcionado'}`);
  
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
    
    // Agregar encabezados para evitar caché
    const headers = new Headers();
    headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', '0');
    
    return NextResponse.json({ categoria, productos }, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la categoría', detalle: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}