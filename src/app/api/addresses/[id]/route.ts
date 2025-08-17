import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { id: addressId } = await params;

    // Verificar que la dirección pertenece al usuario
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id
      }
    });

    if (!address) {
      return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    return NextResponse.json({ message: 'Dirección eliminada correctamente' });
  } catch (error) {
    log.error('Error al eliminar dirección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}