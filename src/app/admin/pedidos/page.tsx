"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Trash2, RefreshCw, Filter, Search, Edit, Truck } from "lucide-react";
import ShippingLabelModal from "@/components/ShippingLabelModal";
import EditOrderModal from "@/components/EditOrderModal";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/pedidos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      });
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (order.id || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    fetch("/api/pedidos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      });
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleShippingLabel = (order: any) => {
    setSelectedOrder(order);
    setIsShippingModalOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este pedido?")) {
      return;
    }

    try {
      const response = await fetch(`/api/pedidos/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar pedido");
      }

      toast.success("Pedido eliminado exitosamente");
      handleRefresh();
    } catch (error) {
      toast.error("Error al eliminar pedido");
    }
  };

  const handleOrderUpdated = () => {
    handleRefresh();
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg lg:text-2xl font-bold text-neutral-700">
            Gestión de Pedidos
          </h1>
          <p className="text-sm lg:text-base text-neutral-600">
            Administra todos los pedidos de la tienda
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm lg:text-base"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por email o ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 lg:py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white text-sm lg:text-base"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="PAID">Pagado</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <button className="btn-secondary flex items-center justify-center gap-2 px-4 py-2 lg:py-3 text-sm lg:text-base">
              <Filter className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {order.user?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    ${order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsShippingModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Truck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-neutral-100 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-neutral-900 truncate">
                  Pedido #{order.id}
                </h3>
                <p className="text-xs text-neutral-500 truncate">
                  {order.user?.email || "N/A"}
                </p>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  statusColors[order.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm">
                <span className="font-medium text-neutral-900">${order.total}</span>
              </div>
              <div className="text-xs text-neutral-500">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/pedidos/${order.id}`}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-md text-xs font-medium"
              >
                <Eye className="h-3 w-3" />
                Ver
              </Link>
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setIsEditModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-medium"
              >
                <Edit className="h-3 w-3" />
                Editar
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setIsShippingModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md text-xs font-medium"
              >
                <Truck className="h-3 w-3" />
                Envío
              </button>
              <button
                onClick={() => handleDeleteOrder(order.id)}
                className="flex items-center justify-center p-2 bg-red-600 text-white rounded-md"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      <ShippingLabelModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        orderId={selectedOrder?.id || ""}
        orderData={selectedOrder}
      />

      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={selectedOrder}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}