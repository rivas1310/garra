"use client";

import { useState, useEffect } from "react";
import { log } from '@/lib/secureLogger'
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  Filter, 
  RefreshCw, 
  DollarSign, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  ShoppingBag
} from "lucide-react";
import toast from "react-hot-toast";
import ReportExporter from "@/components/ReportExporter";

interface ReportsData {
  summary: {
    salesToday: {
      amount: number;
      count: number;
      growth: number;
    };
    salesFisicasToday?: {
      amount: number;
      count: number;
    };
    salesOnlineToday?: {
      amount: number;
      count: number;
    };
    ordersToday: {
      count: number;
      growth: number;
    };
    newClientsToday: {
      count: number;
      growth: number;
    };
    totalProducts: {
      count: number;
      lowStock: number;
      outOfStock: number;
    };
  };
  periods: {
    today: {
      sales: number;
      orders: number;
      clients: number;
    };
    yesterday: {
      sales: number;
      orders: number;
    };
    lastWeek: {
      sales: number;
      orders: number;
      clients: number;
    };
    lastMonth: {
      sales: number;
      orders: number;
    };
  };
  ordersByStatus: Array<{
    status: string;
    count: number;
    total: number;
  }>;
  ordersByType?: Array<{
    type: string;
    count: number;
    total: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    price: number;
    totalQuantity: number;
    totalOrders: number;
  }>;
  totals: {
    totalClients: number;
    totalProducts: number;
    totalSales: number;
    totalOrders: number;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  USER: "Cliente",
  ADMIN: "Administrador",
};

export default function ReportesAdminPage() {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState("today");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/reports');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar los reportes');
      }
      
      setReportsData(result.data);
      toast.success('Reportes actualizados');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const icon = isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="text-sm font-medium">
          {Math.abs(growth).toFixed(1)}%
        </span>
      </div>
    );
  };

  const handleExportSuccess = () => {
    // Opcional: realizar alguna acción después de la exportación
    log.error('Reporte exportado exitosamente');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-neutral-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error || !reportsData) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 mb-4">{error || 'Error al cargar reportes'}</p>
            <button 
              onClick={fetchReports}
              className="btn-primary"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, periods, ordersByStatus, topProducts, totals, ordersByType } = reportsData;

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-700">Reportes y Estadísticas</h1>
              <p className="text-sm sm:text-base text-neutral-600">Visualiza el resumen y análisis de tu tienda</p>
            </div>
            <button 
              onClick={fetchReports}
              className="btn-secondary inline-flex items-center self-start sm:self-auto"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-green-50 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
              {formatGrowth(summary.salesToday.growth)}
            </div>
            <p className="text-sm text-neutral-500">Ventas Totales Hoy</p>
            <p className="text-2xl font-bold text-neutral-700">
              {formatCurrency(summary.salesToday.amount)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {summary.salesToday.count} pedidos
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
              {formatGrowth(summary.ordersToday.growth)}
            </div>
            <p className="text-sm text-neutral-500">Pedidos Hoy</p>
            <p className="text-2xl font-bold text-neutral-700">
              {summary.ordersToday.count}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {formatCurrency(summary.salesToday.amount)} en ventas
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              {formatGrowth(summary.newClientsToday.growth)}
            </div>
            <p className="text-sm text-neutral-500">Nuevos Clientes</p>
            <p className="text-2xl font-bold text-neutral-700">
              {summary.newClientsToday.count}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {totals.totalClients} total
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                <Package className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                {summary.totalProducts.lowStock > 0 && (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                {summary.totalProducts.outOfStock > 0 && (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
            <p className="text-sm text-neutral-500">Productos Activos</p>
            <p className="text-2xl font-bold text-neutral-700">
              {summary.totalProducts.count}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {summary.totalProducts.lowStock} bajo stock • {summary.totalProducts.outOfStock} sin stock
            </p>
          </div>
        </div>
        
        {/* Tarjetas de ventas por tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-neutral-500">Ventas Físicas Hoy</p>
            <p className="text-2xl font-bold text-neutral-700">
              {formatCurrency(summary.salesFisicasToday?.amount || 0)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {summary.salesFisicasToday?.count || 0} ventas físicas
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-cyan-50 text-cyan-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-neutral-500">Ventas Online Hoy</p>
            <p className="text-2xl font-bold text-neutral-700">
              {formatCurrency(summary.salesOnlineToday?.amount || 0)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {summary.salesOnlineToday?.count || 0} ventas online
            </p>
          </div>
        </div>

        {/* Filtros y Exportación */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-auto"
              >
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="lastWeek">Última Semana</option>
                <option value="lastMonth">Último Mes</option>
              </select>
            </div>
            <ReportExporter 
              reportsData={reportsData} 
              onExport={handleExportSuccess}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Pedidos por Estado */}
          <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pedidos por Estado
            </h3>
            <div className="space-y-3">
              {ordersByStatus.map((orderStatus) => (
                <div key={orderStatus.status} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[orderStatus.status]}`}>
                      {orderStatus.status}
                    </span>
                    <span className="text-sm text-neutral-600">
                      {orderStatus.count} pedidos
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(orderStatus.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pedidos por Tipo */}
          <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ventas por Tipo
            </h3>
            <div className="space-y-3">
              {ordersByType && ordersByType.map((orderType) => (
                <div key={orderType.type} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${orderType.type === 'FISICA' ? 'bg-indigo-100 text-indigo-800' : 'bg-cyan-100 text-cyan-800'}`}>
                      {orderType.type === 'FISICA' ? 'FÍSICA' : 'ONLINE'}
                    </span>
                    <span className="text-sm text-neutral-600">
                      {orderType.count} ventas
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(orderType.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Productos Más Vendidos */}
          <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Productos Más Vendidos
            </h3>
            {topProducts.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No hay datos de ventas disponibles</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{product.name}</p>
                        <p className="text-sm text-neutral-500">
                          {product.totalQuantity} unidades • {product.totalOrders} pedidos
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(product.price * product.totalQuantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumen por Períodos */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Resumen por Períodos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-neutral-200 rounded-lg">
              <p className="text-sm text-neutral-500">Hoy</p>
              <p className="text-xl font-bold text-neutral-900">{formatCurrency(periods.today.sales)}</p>
              <p className="text-xs text-neutral-500">{periods.today.orders} pedidos</p>
            </div>
            <div className="text-center p-4 border border-neutral-200 rounded-lg">
              <p className="text-sm text-neutral-500">Ayer</p>
              <p className="text-xl font-bold text-neutral-900">{formatCurrency(periods.yesterday.sales)}</p>
              <p className="text-xs text-neutral-500">{periods.yesterday.orders} pedidos</p>
            </div>
            <div className="text-center p-4 border border-neutral-200 rounded-lg">
              <p className="text-sm text-neutral-500">Última Semana</p>
              <p className="text-xl font-bold text-neutral-900">{formatCurrency(periods.lastWeek.sales)}</p>
              <p className="text-xs text-neutral-500">{periods.lastWeek.orders} pedidos</p>
            </div>
            <div className="text-center p-4 border border-neutral-200 rounded-lg">
              <p className="text-sm text-neutral-500">Último Mes</p>
              <p className="text-xl font-bold text-neutral-900">{formatCurrency(periods.lastMonth.sales)}</p>
              <p className="text-xs text-neutral-500">{periods.lastMonth.orders} pedidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}