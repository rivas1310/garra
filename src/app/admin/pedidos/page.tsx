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
    <div className="min-h-screen bg-gradient-elegant">
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-700">Gestión de Pedidos</h1>
              <p className="text-neutral-600">Administra y gestiona los pedidos de clientes</p>
            </div>
            <button 
              onClick={handleRefresh}
              className="btn-secondary inline-flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por usuario o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Exportar
        </button>
      </div>
      {/* Tabla de pedidos */}
      <table className="w-full">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Usuario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-100">
          {filteredOrders.map((order) => (
            <tr key={order.id} className="hover:bg-neutral-50">
              <td className="px-6 py-4 whitespace-nowrap font-mono">{order.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.user?.email || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>{order.status}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium">${order.total}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/pedidos/${order.id}`} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Ver detalles">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button 
                    onClick={() => handleEditOrder(order)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                    title="Editar pedido"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleShippingLabel(order)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                    title="Generar etiqueta de envío"
                  >
                    <Truck className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteOrder(order.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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