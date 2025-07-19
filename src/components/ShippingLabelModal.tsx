"use client";

import { useState } from "react";
import { X, Truck, Loader2, CheckCircle, AlertCircle, FileText, Info } from "lucide-react";
import toast from "react-hot-toast";

interface ShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderData?: any;
}

export default function ShippingLabelModal({
  isOpen,
  onClose,
  orderId,
  orderData,
}: ShippingLabelModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
  const [cotizacion, setCotizacion] = useState<any>(null);
  const [selectedRate, setSelectedRate] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [customWeight, setCustomWeight] = useState<number>(2);

  if (!isOpen) return null;

  // Función para cotizar con Envíos Perros
  const cotizarEnviosPerros = async () => {
    setIsGenerating(true);
    setError(null);
    setCotizacion(null);
    setSelectedRate(null);
    
    try {
      // Extraer datos del pedido
      const peso = customWeight > 0 ? customWeight : (orderData?.items?.reduce((acc: number, item: any) => acc + (item.product?.weight || 1) * item.quantity, 0) || 2);
      const dimensiones = orderData?.items?.[0]?.product || {};
      const depth = dimensiones.length || 20;
      const width = dimensiones.width || 30;
      const height = dimensiones.height || 10;
      const originCP = orderData?.originPostalCode || orderData?.shippingAddress?.postalCode || "03100";
      const destCP = orderData?.destinationPostalCode || orderData?.address_to?.postalCode || orderData?.shippingAddress?.postalCode || "64000";
      
      const body = {
        depth,
        width,
        height,
        weight: peso,
        origin: { codePostal: originCP },
        destination: { codePostal: destCP },
      };
      
      console.log("Enviando cotización:", body);
      
      const response = await fetch("/api/enviosperros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      console.log("Respuesta de Envíos Perros:", data);
      
      if (!response.ok) {
        throw new Error(data.error || data.data?.message || "Error al cotizar con Envíos Perros");
      }
      
      // Manejar la estructura específica de Envíos Perros
      let rates = [];
      if (data.data && data.data.message && Array.isArray(data.data.message)) {
        rates = data.data.message;
      } else if (data.data && Array.isArray(data.data)) {
        rates = data.data;
      } else if (Array.isArray(data)) {
        rates = data;
      } else {
        throw new Error("Formato de respuesta no reconocido");
      }
      
      setCotizacion(rates);
      
      // Verificar si hay problemas con la cuenta
      const hasAccountIssues = rates.some((rate: any) => 
        rate.status_description && rate.status_description.includes("limite de envíos")
      );
      
      if (hasAccountIssues) {
        toast.error("Problema con la cuenta de Envíos Perros. Contacta al administrador.");
      } else {
        toast.success(`Se encontraron ${rates.length} opciones de envío`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para generar etiqueta
  const generarEtiqueta = async () => {
    if (!selectedRate) {
      toast.error("Debes seleccionar una opción de envío");
      return;
    }
    
    if (!selectedRate.available) {
      toast.error("Esta opción no está disponible actualmente");
      return;
    }
    
    setIsGeneratingLabel(true);
    try {
      // Aquí implementarías la llamada para generar la etiqueta
      // Por ahora solo simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Etiqueta generada exitosamente");
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al generar etiqueta";
      toast.error(errorMessage);
    } finally {
      setIsGeneratingLabel(false);
    }
  };

  // Función para formatear precio
  const formatPrice = (cost: number) => {
    if (cost === 9999) return "Precio no disponible";
    return `$${cost.toLocaleString('es-MX')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Truck className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-700">
                Cotizar Envío con Envíos Perros
              </h3>
              <p className="text-sm text-neutral-500">Pedido #{orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {orderData && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="font-medium text-neutral-700 mb-2">Detalles del Pedido</h4>
              <div className="space-y-1 text-sm text-neutral-600">
                <p><strong>Cliente:</strong> {orderData.user?.email || "N/A"}</p>
                <p><strong>Total:</strong> ${orderData.total}</p>
                <p><strong>Estado:</strong> {orderData.status}</p>
                <p><strong>Productos:</strong> {orderData.items?.length || 0} artículos</p>
              </div>
            </div>
          )}

          {/* Peso personalizado */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Peso del Paquete (kg) - Opcional
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={customWeight || ""}
              onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 0)}
              placeholder="Dejar vacío para cálculo automático"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Peso mínimo: 0.1kg. Si no especifica, se calculará automáticamente.
            </p>
          </div>

          <button
            onClick={cotizarEnviosPerros}
            disabled={isGenerating}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cotizando...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4" />
                Cotizar Envío
              </>
            )}
          </button>

          {/* Mostrar cotización */}
          {cotizacion && Array.isArray(cotizacion) && cotizacion.length > 0 && (
            <div className="mt-4 space-y-4">
              <h4 className="font-medium text-neutral-700 mb-2">Tarifas disponibles</h4>
              
              {/* Alerta de problemas de cuenta */}
              {cotizacion.some((rate: any) => rate.status_description && rate.status_description.includes("limite de envíos")) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Problema con la cuenta</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        La cuenta de Envíos Perros necesita verificación. Contacta al administrador para resolver este problema.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cotizacion.map((rate: any, idx: number) => {
                  const isAvailable = rate.available;
                  const hasAccountIssue = rate.status_description && rate.status_description.includes("limite de envíos");
                  
                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-lg p-3 transition-all ${
                        selectedRate === rate 
                          ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200' 
                          : isAvailable 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer' 
                            : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => isAvailable && setSelectedRate(rate)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Radio button visual */}
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                          selectedRate === rate 
                            ? 'border-primary-600 bg-primary-600' 
                            : isAvailable 
                              ? 'border-gray-300 hover:border-primary-400' 
                              : 'border-gray-200'
                        }`}>
                          {selectedRate === rate && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-neutral-800">
                              {rate.title || rate.deliveryType?.name || 'N/A'}
                            </p>
                            <p className={`text-lg font-bold ${
                              rate.cost === 9999 ? 'text-gray-500' : 'text-primary-600'
                            }`}>
                              {formatPrice(rate.cost || 0)}
                            </p>
                          </div>
                          
                          <p className="text-sm text-neutral-600">
                            <span className="font-medium">{rate.deliveryType?.company || rate.paqueteria || 'N/A'}</span> - {rate.deliveryType?.description || rate.servicio || 'Servicio estándar'}
                          </p>
                          
                          <p className="text-sm text-neutral-600">
                            ⏱️ Tiempo estimado: {rate.deliveryType?.feature || rate.tiempo_entrega || 'N/A'}
                          </p>
                          
                          {!isAvailable && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-700">
                                ⚠️ {rate.status_description || 'No disponible'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Botón para generar etiqueta */}
              {selectedRate && selectedRate.available && (
                <button
                  onClick={generarEtiqueta}
                  disabled={isGeneratingLabel}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  {isGeneratingLabel ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando etiqueta...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Generar Etiqueta con {selectedRate.deliveryType?.company || selectedRate.paqueteria}
                    </>
                  )}
                </button>
              )}
              
              {/* Mensaje cuando no hay opciones disponibles */}
              {cotizacion.every((rate: any) => !rate.available) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">No hay opciones disponibles</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Todas las opciones de envío requieren verificación de cuenta. Contacta al administrador.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mostrar error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Error al cotizar</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}