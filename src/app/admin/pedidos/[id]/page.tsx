"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Edit, Truck, Trash2, User, Calendar, DollarSign, Package, FileText } from "lucide-react";
import toast from "react-hot-toast";
import ShippingLabelModal from "@/components/ShippingLabelModal";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/pedidos/${id}`);
      if (!response.ok) {
        throw new Error("Error al cargar el pedido");
      }
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      toast.error("Error al cargar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este pedido?")) {
      return;
    }

    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar pedido");
      }

      toast.success("Pedido eliminado exitosamente");
      // Redirigir a la lista de pedidos
      window.location.href = "/admin/pedidos";
    } catch (error) {
      toast.error("Error al eliminar pedido");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-700 mb-4">Pedido no encontrado</h2>
          <Link href="/admin/pedidos" className="btn-primary">
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/pedidos"
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-700">
                  Pedido #{order.id}
                </h1>
                <p className="text-neutral-600">
                  Detalles completos del pedido
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/pedidos/${order.id}/editar`}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Link>
              <button
                onClick={handleDeleteOrder}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado del pedido */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-700">
                  Estado del Pedido
                </h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[order.status]}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="p-3 bg-primary-50 rounded-lg mb-2">
                    <DollarSign className="h-6 w-6 text-primary-600 mx-auto" />
                  </div>
                  <p className="text-sm text-neutral-500">Total</p>
                  <p className="font-semibold text-neutral-700">${order.total}</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-secondary-50 rounded-lg mb-2">
                    <Package className="h-6 w-6 text-secondary-600 mx-auto" />
                  </div>
                  <p className="text-sm text-neutral-500">Subtotal</p>
                  <p className="font-semibold text-neutral-700">${order.subtotal}</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-accent-50 rounded-lg mb-2">
                    <Truck className="h-6 w-6 text-accent-600 mx-auto" />
                  </div>
                  <p className="text-sm text-neutral-500">Envío</p>
                  <p className="font-semibold text-neutral-700">${order.shipping}</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-neutral-50 rounded-lg mb-2">
                    <Calendar className="h-6 w-6 text-neutral-600 mx-auto" />
                  </div>
                  <p className="text-sm text-neutral-500">Fecha</p>
                  <p className="font-semibold text-neutral-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Productos del pedido */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">
                Productos del Pedido
              </h2>
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-700">
                        {item.product?.name || "Producto no encontrado"}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        Cantidad: {item.quantity} × ${item.price}
                      </p>
                      {(item.variant?.size || item.variant?.color) && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {item.variant?.size && <span className="mr-2">Talla: {item.variant.size}</span>}
                          {item.variant?.color && <span>Color: {item.variant.color}</span>}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-700">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas del pedido */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
                <h2 className="text-lg font-semibold text-neutral-700 mb-4">
                  Notas del Pedido
                </h2>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-neutral-700 whitespace-pre-wrap">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Información del cliente */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-700">
                  Información del Cliente
                </h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="font-medium text-neutral-700">
                    {order.user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Nombre</p>
                  <p className="font-medium text-neutral-700">
                    {order.user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">ID de Usuario</p>
                  <p className="font-medium text-neutral-700 font-mono text-sm">
                    {order.userId}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de pago */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">
                Información de Pago
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Estado de Pago</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Método de Pago</p>
                  <p className="font-medium text-neutral-700">
                    {order.paymentMethod || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Impuestos</p>
                  <p className="font-medium text-neutral-700">
                    ${order.tax || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">
                Acciones Rápidas
              </h2>
              
              <div className="space-y-3">
                <Link
                  href={`/admin/pedidos/${order.id}/editar`}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar Pedido
                </Link>
                <button 
                  onClick={() => setIsShippingModalOpen(true)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Truck className="h-4 w-4" />
                  Generar Etiqueta
                </button>
                {/* Botón para descargar la guía PDF si existe */}
                {order.shippingLabelUrl && (
                  <a 
                    href={order.shippingLabelUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title="Descargar Guía PDF"
                    className="block"
                  >
                    <button className="w-full btn-success flex items-center justify-center gap-2 mt-2 p-3">
                      <FileText className="h-5 w-5" />
                      Descargar Guía (PDF)
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para generar etiqueta de envío */}
      <ShippingLabelModal 
        isOpen={isShippingModalOpen} 
        onClose={() => {
          setIsShippingModalOpen(false);
          // Recargar el pedido para mostrar la etiqueta si se generó
          fetchOrder();
        }} 
        orderId={id}
        orderData={order}
      />
    </div>
  );
}