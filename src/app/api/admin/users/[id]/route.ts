import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        addresses: {
          orderBy: {
            isDefault: 'desc',
          },
        },
        reviews: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular estadísticas
    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = user.orders.length > 0 ? totalSpent / user.orders.length : 0;

    // Transformar los datos para el frontend
    const transformedUser = {
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
      totalSpent,
      averageOrderValue,
      lastOrder: user.orders[0] ? {
        id: user.orders[0].id,
        status: user.orders[0].status,
        total: user.orders[0].total,
        date: user.orders[0].createdAt.toISOString().split('T')[0],
      } : null,
      orders: user.orders.map(order => ({
        id: order.id,
        status: order.status,
        total: order.total,
        date: order.createdAt.toISOString().split('T')[0],
        items: order.items.length,
      })),
      addresses: user.addresses.map(address => ({
        id: address.id,
        label: address.label || 'Sin etiqueta',
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isDefault: address.isDefault,
      })),
      reviews: user.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || '',
        date: review.createdAt.toISOString().split('T')[0],
        productName: review.product.name,
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedUser,
    });

  } catch (error) {
    log.error('Error fetching user details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los detalles del usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 