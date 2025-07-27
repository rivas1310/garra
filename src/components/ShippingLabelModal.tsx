"use client";

import { useState, useEffect } from "react";
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
  // Estado para guardar los datos exactos de cotización
  const [cotizacionPayload, setCotizacionPayload] = useState<any>(null);
  const [guiaPdfUrl, setGuiaPdfUrl] = useState<string | null>(null);

  // Verificar etiqueta existente al abrir el modal
  useEffect(() => {
    // Función para verificar si ya existe una etiqueta para este pedido
    const verificarEtiquetaExistente = async () => {
      if (!orderId) return;
      
      try {
        const response = await fetch(`/api/pedidos/${orderId}`);
        const data = await response.json();
        
        if (data.shippingLabelUrl) {
          setGuiaPdfUrl(data.shippingLabelUrl);
          toast.success("Este pedido ya tiene una etiqueta de envío generada");
        }
      } catch (error) {
        console.error("Error al verificar etiqueta existente:", error);
      }
    };

    if (isOpen && orderId) {
      verificarEtiquetaExistente();
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  // Función para cotizar con Envío Click
  const cotizarEnvioClick = async () => {
    setIsGenerating(true);
    setError(null);
    setCotizacion(null);
    setSelectedRate(null);
    
    try {
      // Extraer datos del pedido
      const peso = customWeight > 0 ? customWeight : (orderData?.items?.reduce((acc: number, item: any) => acc + (item.product?.weight || 1) * item.quantity, 0) || 2);
      const dimensiones = orderData?.items?.[0]?.product || {};
      const length = dimensiones.length || 30.01;
      const width = dimensiones.width || 20.01;
      const height = dimensiones.height || 15.01;
      const description = dimensiones.name || "Producto";
      const contentValue = dimensiones.price || 120.01;
      const origin_address = orderData?.shippingAddress?.street || "Av. Revolución";
      const origin_number = orderData?.shippingAddress?.number || "381";
      const origin_zip_code = orderData?.shippingAddress?.postalCode || "44100";
      const origin_suburb = orderData?.shippingAddress?.neighborhood || "Guadalajara Centro";
      const destination_address = orderData?.address_to?.street || orderData?.shippingAddress?.street || "Calzada Lázaro Cárdenas";
      const destination_number = orderData?.address_to?.number || orderData?.shippingAddress?.number || "624";
      const destination_zip_code = orderData?.address_to?.postalCode || orderData?.shippingAddress?.postalCode || "44200";
      const destination_suburb = orderData?.address_to?.neighborhood || orderData?.shippingAddress?.neighborhood || "El Santuario";

      const body = {
        origin_address,
        origin_number,
        origin_zip_code,
        origin_suburb,
        destination_address,
        destination_number,
        destination_zip_code,
        destination_suburb,
        package: {
          description,
          contentValue,
          weight: peso,
          length,
          height,
          width
        }
      };
      setCotizacionPayload(body); // Guarda el payload exacto
      
      console.log("Enviando cotización:", body);
      
      const response = await fetch("/api/envioclick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      console.log("Respuesta completa de la API:", data);
      console.log("Respuesta de Envío Click:", data);
      
      if (!response.ok) {
        throw new Error(data.error || data.data?.message || "Error al cotizar con Envío Click");
      }
      
      // Función auxiliar para extraer propiedades con diferentes rutas posibles
      const getProperty = (obj: any, paths: string[]): any => {
        for (const path of paths) {
          const value = path.split('.').reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
          if (value !== undefined) return value;
        }
        return undefined;
      };
      
      // Función para buscar tarifas en diferentes rutas de la respuesta
      const findRates = (responseData: any): any[] => {
        // Posibles rutas donde pueden estar las tarifas
        const possiblePaths = [
          'data.rates',
          'data.data.rates',
          'rates',
          'data',
          'data.data'
        ];
        
        for (const path of possiblePaths) {
          const potentialRates = getProperty(responseData, [path]);
          
          if (potentialRates) {
            // Si encontramos un array, asumimos que son las tarifas
            if (Array.isArray(potentialRates)) {
              return potentialRates;
            }
            // Si es un objeto con propiedades que parecen tarifas, convertirlo a array
            else if (typeof potentialRates === 'object' && potentialRates !== null) {
              // Verificar si tiene propiedades que parecen ser tarifas (cost, carrier, etc.)
              if ('cost' in potentialRates || 'carrier' in potentialRates || 'service' in potentialRates) {
                return [potentialRates];
              }
              
              // Intentar convertir el objeto a un array si sus valores parecen ser tarifas
              const values = Object.values(potentialRates);
              if (values.length > 0 && values.every(v => typeof v === 'object' && v !== null)) {
                return values;
              }
            }
          }
        }
        
        return [];
      };
      
      // Buscar tarifas usando la función auxiliar
      const rates = findRates(data);
      console.log("Estructura de la respuesta:", JSON.stringify(data, null, 2));
      console.log("Tarifas encontradas:", rates);
      
      // Si encontramos tarifas, mostrar la primera para depuración
      if (rates.length > 0) {
        console.log("Primera tarifa encontrada:", rates[0]);
      } else {
        // Buscar mensaje de error en la respuesta
        const apiError = getProperty(data, [
          'data.status_messages.0.error',
          'status_messages.0.error',
          'error',
          'data.error',
          'data.message',
          'message'
        ]);
        
        if (apiError) {
          throw new Error(apiError);
        } else {
          throw new Error("No se encontraron cotizaciones para los datos proporcionados.");
        }
      }
      
      setCotizacion(rates);
      
      // Verificar si hay problemas con la cuenta
      const hasAccountIssues = rates.some((rate: any) => {
        const statusDescription = getProperty(rate, ['status_description', 'statusDescription', 'description']);
        return statusDescription && typeof statusDescription === 'string' && 
          statusDescription.toLowerCase().includes('limite de envíos');
      });
      
      if (hasAccountIssues) {
        toast.error("Problema con la cuenta de Envío Click. Contacta al administrador.");
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

  // Esta sección se ha movido arriba del condicional return

  // Función para generar etiqueta
  const generarEtiqueta = async () => {
    if (!selectedRate || !cotizacionPayload) {
      toast.error("Selecciona una tarifa de envío primero");
      return;
    }
    
    setIsGeneratingLabel(true);
    setError(null);

    // Función auxiliar para extraer propiedades con diferentes rutas posibles
    const getProperty = (obj: any, paths: string[]): any => {
      for (const path of paths) {
        const value = path.split('.').reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
        if (value !== undefined) return value;
      }
      return undefined;
    };
    
    // Usa los datos exactos de cotización
    const payload = {
      orderId: orderId, // Importante: incluir el ID del pedido para actualizar en la base de datos
      idRate: getProperty(selectedRate, ['idRate', 'id', 'rate_id']),
      myShipmentReference: orderId || "Referencia de envío",
      requestPickup: true,
      pickupDate: new Date().toISOString().slice(0, 10),
      insurance: true,
      // Información de la tarifa seleccionada para guardar en la base de datos
      shippingCost: getProperty(selectedRate, ['cost', 'total', 'price', 'amount']) || 0,
      shippingProvider: getProperty(selectedRate, ['carrier', 'deliveryType.company', 'company', 'paqueteria']) || "EnvioClick",
      package: {
        ...cotizacionPayload.package,
        items: [
          {
            c_ClaveUnidadPeso: "XPK",
            c_ClaveProdServCP: "31181701",
            c_MaterialPeligroso: null,
            c_TipoEmbalaje: null,
            contentValue: cotizacionPayload.package.contentValue,
            units: 1
          }
        ]
      },
      origin: {
        company: orderData?.shippingAddress?.company || "Mi Empresa",
        rfc: orderData?.shippingAddress?.rfc || "XAXX010101000",
        firstName: orderData?.shippingAddress?.name?.split(" ")[0] || "Pedro",
        lastName: orderData?.shippingAddress?.name?.split(" ")[1] || "López",
        email: orderData?.user?.email || "pedro.lopez@example.com",
        phone: orderData?.shippingAddress?.phone || "3333333333",
        street: cotizacionPayload.origin_address,
        number: cotizacionPayload.origin_number,
        intNumber: orderData?.shippingAddress?.intNumber || "1",
        suburb: cotizacionPayload.origin_suburb,
        crossStreet: orderData?.shippingAddress?.crossStreet || "Calle 1 y Calle 2",
        zipCode: cotizacionPayload.origin_zip_code,
        reference: orderData?.shippingAddress?.reference || "Ventana blanca grande",
        observations: orderData?.shippingAddress?.observations || "Sin observaciones"
      },
      destination: {
        company: orderData?.address_to?.company || "Cliente",
        rfc: orderData?.address_to?.rfc || "XAXX010101000",
        firstName: orderData?.address_to?.name?.split(" ")[0] || "Pedro",
        lastName: orderData?.address_to?.name?.split(" ")[1] || "López",
        email: orderData?.address_to?.email || "pedro.lopez@example.com",
        phone: orderData?.address_to?.phone || "3333333333",
        street: cotizacionPayload.destination_address,
        number: cotizacionPayload.destination_number,
        intNumber: orderData?.address_to?.intNumber || "1",
        suburb: cotizacionPayload.destination_suburb,
        crossStreet: orderData?.address_to?.crossStreet || "Calle 3 y Calle 4",
        zipCode: cotizacionPayload.destination_zip_code,
        reference: orderData?.address_to?.reference || "Puerta azul",
        observations: orderData?.address_to?.observations || "Sin observaciones"
      }
    };

    try {
      toast.loading("Generando etiqueta de envío...");
      const response = await fetch("/api/envioclick/generar-guia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar la guía");
      }
      
      const data = await response.json();
      console.log("Respuesta completa de generación de guía:", JSON.stringify(data, null, 2));
      
      // Mostrar información de depuración si está disponible
      if (data.debug) {
        console.log("Información de depuración de la API:", data.debug);
      }
      
      // Busca el PDF en la respuesta usando getProperty con más rutas posibles
      const pdfUrl = getProperty(data, [
        'labelUrl', 
        'pdfUrl', 
        'data.labelUrl', 
        'data.pdfUrl',
        'data.data.labelUrl',
        'data.data.pdfUrl',
        'data.label_url',
        'label_url',
        'pdf_url',
        'data.pdf_url'
      ]);
      console.log("URL del PDF encontrada:", pdfUrl);
      setGuiaPdfUrl(pdfUrl || null);
      console.log("Estado guiaPdfUrl después de establecerlo:", pdfUrl);
      
      if (pdfUrl) {
        toast.dismiss();
        toast.success("¡Guía generada correctamente!");
        // Actualizar la UI para mostrar la sección de etiqueta generada
        setCotizacion(null); // Ocultar las cotizaciones
        setSelectedRate(null); // Limpiar la selección
      } else {
        toast.dismiss();
        console.error("No se encontró URL de PDF en la respuesta. Estructura de la respuesta:", data);
        
        // Intentar buscar cualquier URL en la respuesta que pueda contener 'pdf' o 'label'
        const findPdfUrlInObject = (obj: any, path = ''): string | null => {
          if (!obj || typeof obj !== 'object') return null;
          
          for (const key in obj) {
            const currentPath = path ? `${path}.${key}` : key;
            const value = obj[key];
            
            // Si es una cadena y parece una URL de PDF o etiqueta
            if (typeof value === 'string' && 
                (value.includes('.pdf') || 
                 value.toLowerCase().includes('label') || 
                 value.toLowerCase().includes('etiqueta'))) {
              console.log(`Posible URL de PDF encontrada en ${currentPath}:`, value);
              return value;
            }
            
            // Recursivamente buscar en objetos anidados
            if (typeof value === 'object' && value !== null) {
              const result = findPdfUrlInObject(value, currentPath);
              if (result) return result;
            }
          }
          
          return null;
        };
        
        const possiblePdfUrl = findPdfUrlInObject(data);
        if (possiblePdfUrl) {
          console.log("Se encontró una posible URL de PDF mediante búsqueda profunda:", possiblePdfUrl);
          setGuiaPdfUrl(possiblePdfUrl);
          toast.success("¡Guía generada correctamente!");
          setCotizacion(null);
          setSelectedRate(null);
        } else {
          toast("Guía generada, pero no se encontró URL de descarga.");
        }
      }
    } catch (err) {
      toast.dismiss();
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast.error(`Error al generar la guía: ${errorMessage}`);
      console.error("Error al generar guía:", err);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary-50 rounded-lg">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-700">
                Cotizar Envío con Envío Click
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500">Pedido #{orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {orderData && (
            <div className="bg-neutral-50 rounded-lg p-3 sm:p-4">
              <h4 className="font-medium text-neutral-700 mb-2 text-sm sm:text-base">Detalles del Pedido</h4>
              <div className="space-y-1 text-xs sm:text-sm text-neutral-600">
                <p><strong>Cliente:</strong> <span className="truncate block">{orderData.user?.email || "N/A"}</span></p>
                <p><strong>Total:</strong> ${orderData.total}</p>
                <p><strong>Estado:</strong> {orderData.status}</p>
                <p><strong>Productos:</strong> {orderData.items?.length || 0} artículos</p>
              </div>
            </div>
          )}

          {/* Peso personalizado */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-2">
              Peso del Paquete (kg) - Opcional
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={customWeight || ""}
              onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 0)}
              placeholder="Dejar vacío para cálculo automático"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Peso mínimo: 0.1kg. Si no especifica, se calculará automáticamente.
            </p>
          </div>

          <button
            onClick={cotizarEnvioClick}
            disabled={isGenerating}
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                Cotizando...
              </>
            ) : (
              <>
                <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Cotizar Envío
              </>
            )}
          </button>

          {/* Mostrar cotización */}
          {cotizacion && Array.isArray(cotizacion) && cotizacion.length > 0 && (
            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
              <h4 className="font-medium text-neutral-700 mb-2 text-sm sm:text-base">Tarifas disponibles</h4>
              
              {/* Alerta de problemas de cuenta */}
              {((): React.ReactNode => {
                // Función auxiliar para extraer propiedades con diferentes rutas posibles
                const getProperty = (obj: any, paths: string[]): any => {
                  for (const path of paths) {
                    const value = path.split('.').reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
                    if (value !== undefined) return value;
                  }
                  return undefined;
                };
                const hasLimit = cotizacion.some((rate: any) => {
                  const statusDescription = getProperty(rate, ['status_description', 'statusDescription', 'description']);
                  return statusDescription && typeof statusDescription === 'string' && 
                    statusDescription.toLowerCase().includes('limite de envíos');
                });
                let alert: React.ReactNode = null;
                if (hasLimit) {
                  alert = (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 text-sm sm:text-base">Problema con la cuenta</h4>
                          <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                            La cuenta de Envío Click necesita verificación. Contacta al administrador para resolver este problema.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return alert;
              })()}
              
              <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                {cotizacion.map((rate: any, idx: number) => {
                  // Función auxiliar para extraer propiedades con diferentes rutas posibles
                  const getProperty = (obj: any, paths: string[]): any => {
                    for (const path of paths) {
                      const value = path.split('.').reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
                      if (value !== undefined) return value;
                    }
                    return undefined;
                  };
                  
                  // Determinar si la tarifa está disponible
                  const isAvailable = getProperty(rate, ['available', 'isAvailable', 'status']) !== false;
                  
                  // Verificar si hay problemas con la cuenta
                  const statusDescription = getProperty(rate, ['status_description', 'statusDescription', 'description']);
                  const hasAccountIssue = statusDescription && typeof statusDescription === 'string' && 
                    statusDescription.toLowerCase().includes('limite de envíos');
                  
                  // Obtener el costo
                  const cost = getProperty(rate, ['cost', 'total', 'price', 'amount']);
                  
                  // Obtener el título/nombre del servicio
                  const title = getProperty(rate, [
                    'title', 
                    'deliveryType.name', 
                    'name',
                    'product',
                    'service'
                  ]);
                  
                  // Obtener la compañía/paquetería
                  const company = getProperty(rate, [
                    'deliveryType.company', 
                    'paqueteria', 
                    'carrier',
                    'company'
                  ]);
                  
                  // Obtener la descripción del servicio
                  const serviceDescription = getProperty(rate, [
                    'deliveryType.description', 
                    'servicio', 
                    'description',
                    'service'
                  ]);
                  
                  // Obtener el tiempo de entrega
                  const deliveryTime = getProperty(rate, [
                    'deliveryType.feature', 
                    'tiempo_entrega', 
                    'deliveryTime',
                    'estimatedDelivery'
                  ]);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-lg p-2 sm:p-3 transition-all ${
                        selectedRate === rate 
                          ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200' 
                          : isAvailable 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer' 
                            : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => isAvailable && setSelectedRate(rate)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        {/* Radio button visual */}
                        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                          selectedRate === rate 
                            ? 'border-primary-600 bg-primary-600' 
                            : isAvailable 
                              ? 'border-gray-300 hover:border-primary-400' 
                              : 'border-gray-200'
                        }`}>
                          {selectedRate === rate && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                            <p className="font-medium text-neutral-800 text-sm sm:text-base">
                              {title || 'Servicio de Envío'}
                            </p>
                            <p className={`text-base sm:text-lg font-bold ${
                              cost === 9999 ? 'text-gray-500' : 'text-primary-600'
                            }`}>
                              {formatPrice(cost || 0)}
                            </p>
                          </div>
                          
                          <p className="text-xs sm:text-sm text-neutral-600">
                            <span className="font-medium">{company || 'Paquetería'}</span> - {serviceDescription || 'Servicio estándar'}
                          </p>
                          
                          <p className="text-xs sm:text-sm text-neutral-600">
                            ⏱️ Tiempo estimado: {deliveryTime || 'Consultar con paquetería'}
                          </p>
                          
                          {!isAvailable && (
                            <div className="mt-2 p-1.5 sm:p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-xs sm:text-sm text-red-700">
                                ⚠️ {statusDescription || 'No disponible'}
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
              {selectedRate && (
                <button
                  onClick={generarEtiqueta}
                  disabled={isGeneratingLabel}
                  className="w-full btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3"
                >
                  {isGeneratingLabel ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      Generando etiqueta...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Generar Etiqueta con {
                        (() => {
                          // Usar la misma función getProperty definida anteriormente
                          const getProperty = (obj: any, paths: string[]): any => {
                            for (const path of paths) {
                              const value = path.split('.').reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
                              if (value !== undefined) return value;
                            }
                            return undefined;
                          };
                          
                          return getProperty(selectedRate, [
                            'deliveryType.company', 
                            'paqueteria', 
                            'carrier',
                            'company'
                          ]) || 'Paquetería';
                        })()
                      }
                    </>
                  )}
                </button>
              )}
              
              {/* Mensaje cuando no hay opciones disponibles */}
              {cotizacion.every((rate: any) => {
                // Función auxiliar para extraer propiedades con diferentes rutas posibles
                const getProperty = (obj: any, paths: string[]): any => {
                  for (const path of paths) {
                    const value = path.split('.').reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
                    if (value !== undefined) return value;
                  }
                  return undefined;
                };
                
                // Verificar disponibilidad en diferentes rutas posibles
                const isAvailable = getProperty(rate, ['available', 'isAvailable']);
                return isAvailable === false;
              }) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 text-sm sm:text-base">No hay opciones disponibles</h4>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">
                        Todas las opciones de envío requieren verificación de cuenta. Contacta al administrador.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No se encontraron cotizaciones */}
          {cotizacion && Array.isArray(cotizacion) && cotizacion.length === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 text-sm sm:text-base">Sin opciones disponibles</h4>
                  <p className="text-xs sm:text-sm text-red-700 mt-1">
                    No se encontraron cotizaciones para los datos proporcionados.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mostrar error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 text-sm sm:text-base">Error al cotizar</h4>
                  <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      
      {/* Sección de etiqueta generada */}
      {(() => { console.log("Valor de guiaPdfUrl al renderizar:", guiaPdfUrl); return null; })()}
      {guiaPdfUrl && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 text-sm sm:text-base">Etiqueta de envío generada</h4>
              <p className="text-xs sm:text-sm text-green-700 mt-1">
                La etiqueta de envío ha sido generada correctamente y guardada en el sistema.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 sm:gap-3 mt-2">
            {(() => { console.log("Renderizando botón de descarga con URL:", guiaPdfUrl); return null; })()}
            <a 
              href={guiaPdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2 p-2 sm:p-3 text-sm sm:text-base"
              onClick={() => console.log("Botón de descarga clickeado con URL:", guiaPdfUrl)}
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Ver/Descargar Etiqueta
            </a>
            
            <button 
              onClick={() => {
                console.log("Abriendo URL manualmente:", guiaPdfUrl);
                window.open(guiaPdfUrl, "_blank");
              }}
              className="btn-primary flex items-center justify-center gap-2 p-2 sm:p-3 text-sm sm:text-base"
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Abrir PDF (Alternativo)
            </button>
            
            <button 
              onClick={onClose}
              className="btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base p-2 sm:p-3"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}