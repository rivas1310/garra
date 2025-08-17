import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            addresses: true,
          },
        },
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Solo la última orden
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformar los datos para el frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name || 'Sin nombre',
      phone: user.phone || 'Sin teléfono',
      role: user.role,
      status: user.role === 'ADMIN' ? 'admin' : 'activo',
      registered: user.createdAt.toISOString().split('T')[0],
      lastActivity: user.updatedAt.toISOString().split('T')[0],
      totalOrders: user._count.orders,
      totalReviews: user._count.reviews,
      totalAddresses: user._count.addresses,
      lastOrder: user.orders[0] ? {
        id: user.orders[0].id,
        status: user.orders[0].status,
        total: user.orders[0].total,
        date: user.orders[0].createdAt.toISOString().split('T')[0],
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      total: transformedUsers.length,
    });

  } catch (error) {
    log.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los usuarios',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 