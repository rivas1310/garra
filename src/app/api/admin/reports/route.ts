import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener fecha actual y fechas para comparación
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Estadísticas de ventas (todas)
    const salesToday = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: today,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    });
    
    // Estadísticas de ventas físicas
    const salesFisicasToday = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: today,
        },
        status: {
          not: 'CANCELLED',
        },
        orderType: 'FISICA',
      },
      _sum: {
        total: true,
      },
      _count: true,
    });
    
    // Estadísticas de ventas en línea
    const salesOnlineToday = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: today,
        },
        status: {
          not: 'CANCELLED',
        },
        orderType: 'ONLINE',
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    const salesYesterday = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    const salesLastWeek = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: lastWeek,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    const salesLastMonth = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: lastMonth,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Estadísticas de clientes
    const newClientsToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
        role: 'USER',
      },
    });

    const newClientsLastWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: lastWeek,
        },
        role: 'USER',
      },
    });

    const totalClients = await prisma.user.count({
      where: {
        role: 'USER',
      },
    });

    // Estadísticas de productos
    const totalProducts = await prisma.product.count({
      where: {
        isActive: true,
      },
    });

    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        stock: {
          lte: 10,
        },
      },
    });

    const outOfStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        stock: 0,
      },
    });

    // Estadísticas de pedidos por estado
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      _sum: {
        total: true,
      },
    });
    
    // Estadísticas de pedidos por tipo (físico/online)
    const ordersByType = await prisma.order.groupBy({
      by: ['orderType'],
      _count: {
        orderType: true,
      },
      _sum: {
        total: true,
      },
    });

    // Productos más vendidos (últimos 30 días)
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: lastMonth,
          },
          status: {
            not: 'CANCELLED',
          },
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Obtener nombres de productos para los más vendidos
    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true },
        });
        return {
          productId: item.productId,
          name: product?.name || 'Producto eliminado',
          price: product?.price || 0,
          totalQuantity: item._sum.quantity || 0,
          totalOrders: item._count.productId,
        };
      })
    );

    // Calcular crecimiento
    const salesGrowth = salesYesterday._sum.total 
      ? ((salesToday._sum.total || 0) - salesYesterday._sum.total) / salesYesterday._sum.total * 100
      : 0;

    const ordersGrowth = salesYesterday._count 
      ? ((salesToday._count || 0) - salesYesterday._count) / salesYesterday._count * 100
      : 0;

    const clientsGrowth = newClientsLastWeek > 0 
      ? (newClientsToday - newClientsLastWeek / 7) / (newClientsLastWeek / 7) * 100
      : 0;

    // Preparar datos para el frontend
    const reports = {
      summary: {
        salesToday: {
          amount: salesToday._sum.total || 0,
          count: salesToday._count || 0,
          growth: salesGrowth,
        },
        salesFisicasToday: {
          amount: salesFisicasToday._sum.total || 0,
          count: salesFisicasToday._count || 0,
        },
        salesOnlineToday: {
          amount: salesOnlineToday._sum.total || 0,
          count: salesOnlineToday._count || 0,
        },
        ordersToday: {
          count: salesToday._count || 0,
          growth: ordersGrowth,
        },
        newClientsToday: {
          count: newClientsToday,
          growth: clientsGrowth,
        },
        totalProducts: {
          count: totalProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
        },
      },
      periods: {
        today: {
          sales: salesToday._sum.total || 0,
          orders: salesToday._count || 0,
          clients: newClientsToday,
        },
        yesterday: {
          sales: salesYesterday._sum.total || 0,
          orders: salesYesterday._count || 0,
        },
        lastWeek: {
          sales: salesLastWeek._sum.total || 0,
          orders: salesLastWeek._count || 0,
          clients: newClientsLastWeek,
        },
        lastMonth: {
          sales: salesLastMonth._sum.total || 0,
          orders: salesLastMonth._count || 0,
        },
      },
      ordersByStatus: ordersByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
        total: item._sum.total || 0,
      })),
      ordersByType: ordersByType.map(item => ({
        type: item.orderType,
        count: item._count.orderType,
        total: item._sum.total || 0,
      })),
      topProducts: topProductsWithNames,
      totals: {
        totalClients,
        totalProducts,
        totalSales: salesLastMonth._sum.total || 0,
        totalOrders: salesLastMonth._count || 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: reports,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    log.error('Error fetching reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los reportes',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}