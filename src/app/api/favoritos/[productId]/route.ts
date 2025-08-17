import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { productId } = await context.params;
    
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

    // Remover de favoritos
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        favorites: {
          disconnect: { id: productId },
        },
      },
    });

    return NextResponse.json({ message: 'Producto removido de favoritos' });
  } catch (error) {
    log.error('Error al remover de favoritos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 