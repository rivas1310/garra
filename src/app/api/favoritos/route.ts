import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener el usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        favorites: {
          include: {
            category: true,
            variants: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Mapear los productos favoritos con el formato esperado
    const favorites = user.favorites.map(product => {
      // Calcular el stock total
      let totalStock;
      if (product.variants && product.variants.length > 0) {
        totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
      } else {
        totalStock = product.stock;
      }

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png',
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        category: product.category?.name || '',
        isNew: product.isNew,
        isOnSale: product.isOnSale,
        isSecondHand: product.isSecondHand,
        totalStock,
        isActive: product.isActive,
        isAvailable: totalStock > 0 && product.isActive,
        variants: product.variants,
      };
    });

    return NextResponse.json(favorites);
  } catch (error) {
    log.error('Error al obtener favoritos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { productId } = await req.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Agregar a favoritos
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        favorites: {
          connect: { id: productId },
        },
      },
    });

    return NextResponse.json({ message: 'Producto agregado a favoritos' });
  } catch (error) {
    log.error('Error al agregar a favoritos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 