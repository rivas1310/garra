import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Las contraseñas nuevas no coinciden' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    // Obtener el usuario con la contraseña hasheada
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        hashedPassword: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario tenga contraseña (no es usuario de Google)
    if (!user.hashedPassword) {
      return NextResponse.json({ error: 'No puedes cambiar la contraseña de una cuenta de Google' }, { status: 400 });
    }

    // Verificar la contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.hashedPassword);
    
    if (isNewPasswordSame) {
      return NextResponse.json({ error: 'La nueva contraseña debe ser diferente a la actual' }, { status: 400 });
    }

    // Hashear la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword: hashedNewPassword }
    });

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    log.error('Error al cambiar contraseña:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 