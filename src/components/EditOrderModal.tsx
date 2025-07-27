"use client";

import { useState } from "react";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onOrderUpdated: () => void;
}

const orderStatuses = [
  { value: "PENDING", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "CONFIRMED", label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  { value: "PROCESSING", label: "Procesando", color: "bg-indigo-100 text-indigo-800" },
  { value: "SHIPPED", label: "Enviado", color: "bg-purple-100 text-purple-800" },
  { value: "DELIVERED", label: "Entregado", color: "bg-green-100 text-green-800" },
  { value: "CANCELLED", label: "Cancelado", color: "bg-red-100 text-red-800" },
  { value: "REFUNDED", label: "Reembolsado", color: "bg-gray-100 text-gray-800" },
];

export default function EditOrderModal({ 
  isOpen, 
  onClose, 
  order, 
  onOrderUpdated 
}: EditOrderModalProps) {
  const [status, setStatus] = useState(order?.status || "PENDING");
  const [notes, setNotes] = useState(order?.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!order?.id) {
      toast.error("ID de pedido no válido");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/pedidos/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar pedido");
      }

      toast.success("Pedido actualizado exitosamente");
      onOrderUpdated();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h3 className="text-lg font-semibold text-neutral-700">
              Editar Pedido
            </h3>
            <p className="text-sm text-neutral-500">
              Pedido #{order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Información del pedido */}
          <div className="bg-neutral-50 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-neutral-700 mb-3">
              Información del Pedido
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <p className="text-neutral-500 text-xs sm:text-sm">Cliente</p>
                <p className="font-medium truncate">{order.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-xs sm:text-sm">Total</p>
                <p className="font-medium">${order.total}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-xs sm:text-sm">Fecha</p>
                <p className="font-medium">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 text-xs sm:text-sm">Estado actual</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  orderStatuses.find(s => s.value === order.status)?.color || "bg-gray-100 text-gray-800"
                }`}>
                  {orderStatuses.find(s => s.value === order.status)?.label || order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Estado del pedido */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Estado del Pedido
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              {orderStatuses.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notas del Pedido
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
              placeholder="Agregar notas sobre el pedido..."
            />
          </div>

          {/* Advertencia para envíos */}
          {status === "SHIPPED" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">
                    Pedido marcado como enviado
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-700 mt-1">
                    Recuerda generar la etiqueta de envío usando el botón de envío en la tabla de pedidos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-3 p-4 sm:p-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}