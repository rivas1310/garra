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
  
  // Parámetros de paginación
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '0'); // 0 = sin límite (comportamiento original)
  const subcategoria = searchParams.get('subcategoria') || '';
  
  log.error(`API /categorias/${slug}: Obteniendo categoría y productos. Page: ${page}, Limit: ${limit}, Subcategoria: ${subcategoria}, Timestamp: ${timestamp || 'no proporcionado'}`);
  
  try {
    const categoria = await prisma.category.findUnique({
      where: { slug },
    });
    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    
    // Construir filtros
    const whereClause: any = {
      categoryId: categoria.id,
      isActive: true
    };
    
    // Agregar filtro de subcategoría si se especifica
    if (subcategoria) {
      whereClause.subcategoria = {
        contains: subcategoria,
        mode: 'insensitive'
      };
    }
    
    // Obtener total de productos para paginación
    const totalProductos = await prisma.product.count({
      where: whereClause
    });
    
    // Configurar paginación
    const queryOptions: any = {
      where: whereClause,
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
        isSecondHand: true,
        stock: true,
        subcategoria: true,
      },
    };
    
    // Solo agregar paginación si limit > 0
    if (limit > 0) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }
    
    const productos = await prisma.product.findMany(queryOptions);
    
    // Agregar encabezados para evitar caché
    const headers = new Headers();
    headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', '0');
    
    // Preparar respuesta con información de paginación
    const response: any = {
      categoria,
      productos
    };
    
    // Solo agregar información de paginación si se está usando limit
    if (limit > 0) {
      const totalPages = Math.ceil(totalProductos / limit);
      response.pagination = {
        currentPage: page,
        totalPages,
        totalProducts: totalProductos,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        limit
      };
    } else {
      // Para compatibilidad, agregar total sin paginación
      response.totalProducts = totalProductos;
    }
    
    return NextResponse.json(response, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la categoría', detalle: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}