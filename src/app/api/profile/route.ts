import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true
      }
    })

    log.error('📤 Usuario encontrado en BD:', user)

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    log.error('Error al obtener perfil:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, email, phone, avatar } = await request.json();
    log.error('📝 Datos recibidos en PUT /api/profile:', { name, email, phone, avatar });

    if (!name || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 });
    }

    // Verificar si el nuevo email ya existe (si es diferente al actual)
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Este email ya está en uso' }, { status: 400 });
      }
    }

    const updateData: any = { name, email };
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    
    console.log('🔄 Datos a actualizar en BD:', updateData);
    console.log('📧 Email de sesión:', session.user.email);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
        role: true
      }
    });

    console.log('✅ Usuario actualizado en BD:', updatedUser);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}