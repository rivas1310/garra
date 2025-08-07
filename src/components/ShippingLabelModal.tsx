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
  // Estado para seleccionar el proveedor de envío
  const [shippingProvider, setShippingProvider] = useState<'envioclick' | 'enviosperros'>('envioclick');

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

  // Función para cotizar envío según el proveedor seleccionado
  const cotizarEnvio = async () => {
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
      // Dirección real de la tienda como valores por defecto
      const origin_address = orderData?.shippingAddress?.street || "Av. Revolución";
      const origin_number = orderData?.shippingAddress?.number || "381";
      const origin_zip_code = orderData?.shippingAddress?.postalCode || "44100";
      const origin_suburb = orderData?.shippingAddress?.neighborhood || "Guadalajara Centro";
      const destination_address = orderData?.address_to?.street || orderData?.shippingAddress?.street || "Calzada Lázaro Cárdenas";
      const destination_number = orderData?.address_to?.number || orderData?.shippingAddress?.number || "624";
      const destination_zip_code = orderData?.address_to?.postalCode || orderData?.shippingAddress?.postalCode || "44200";
      const destination_suburb = orderData?.address_to?.neighborhood || orderData?.shippingAddress?.neighborhood || "El Santuario";

      let body;
      let endpoint;
      
      if (shippingProvider === 'envioclick') {
        // Preparar payload para EnvioClick
        body = {
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
        endpoint = "/api/envioclick";
      } else {
        // Preparar payload para EnviosPerros
        body = {
          depth: length,
          width: width,
          height: height,
          weight: peso,
          "origin-codePostal": origin_zip_code,
          "destination-codePostal": destination_zip_code
        };
        endpoint = "/api/enviosperros";
      }
      
      setCotizacionPayload(body); // Guarda el payload exacto
      
      console.log(`Enviando cotización a ${shippingProvider}:`, body);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      console.log(`Respuesta de ${shippingProvider}:`, data);
      
      if (!response.ok) {
        throw new Error(data.error || data.data?.message || `Error al cotizar con ${shippingProvider === 'envioclick' ? 'Envío Click' : 'Envíos Perros'}`);
      }
      
      // Función auxiliar para extraer propiedades con diferentes rutas posibles
  const getProperty = (obj: any, paths: string[], defaultValue: any = null): any => {
    // Si el objeto es nulo o indefinido, devolver el valor por defecto
    if (obj === null || obj === undefined) {
      return defaultValue;
    }
    
    for (const path of paths) {
      try {
        const value = path.split('.').reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
        if (value !== undefined) return value;
      } catch (error) {
        console.error(`Error al acceder a la ruta ${path}:`, error);
      }
    }
    return defaultValue;
  };
      
  // Función para encontrar las tarifas en diferentes formatos de respuesta
  const findRates = (responseData: any): any[] => {
    console.log("Buscando tarifas en la respuesta:", JSON.stringify(responseData, null, 2));
    
    // Verificar si la respuesta es de EnviosPerros
    if (shippingProvider === 'enviosperros') {
      console.log("Procesando respuesta de EnviosPerros");
      
      // Verificar si la respuesta tiene el nuevo formato con 'message'
      if (responseData.message && Array.isArray(responseData.message)) {
        console.log("Encontradas tarifas en formato message:", responseData.message);
        // Verificar si los elementos del array tienen valores válidos
        const validRates = responseData.message.map((rate: any) => {
          return {
            title: getProperty(rate, ['title'], 'Servicio de Envío Estándar'),
            deliveryType: {
              name: getProperty(rate, ['deliveryType.name'], 'Estándar'),
              feature: getProperty(rate, ['deliveryType.feature'], 'Entrega a domicilio'),
              description: getProperty(rate, ['deliveryType.description'], 'Servicio estándar de entrega'),
              company: getProperty(rate, ['deliveryType.company'], 'EnviosPerros')
            },
            packageSize: getProperty(rate, ['packageSize'], '1'),
            cost: getProperty(rate, ['cost'], 150),
            currency: getProperty(rate, ['currency'], 'MXN'),
            pickup: getProperty(rate, ['pickup'], false),
            available: true
          };
        });
        return validRates;
      }
      
      // Si la respuesta es exitosa (success=true, statusCode=200) - formato antiguo
      if (responseData.success === true && responseData.statusCode === 200) {
        console.log("Respuesta exitosa de EnviosPerros (formato antiguo)");
        
        // Si tiene datos en formato array, usarlos directamente
        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          console.log("Encontradas tarifas en data (array):", responseData.data);
          const validRates = responseData.data.map((rate: any) => {
            return {
              title: getProperty(rate, ['title', 'name', 'service_level.name'], 'Servicio de Envío Estándar'),
              deliveryType: {
                name: getProperty(rate, ['deliveryType.name', 'service_level.name'], 'Estándar'),
                feature: getProperty(rate, ['deliveryType.feature'], 'Entrega a domicilio'),
                description: getProperty(rate, ['deliveryType.description', 'description'], 'Servicio estándar de entrega'),
                company: rate.carrier || rate.provider || getProperty(rate, ['deliveryType.company', 'provider', 'carrier'], 'Paquetería')
              },
              packageSize: getProperty(rate, ['packageSize'], '1'),
              cost: getProperty(rate, ['cost', 'amount', 'total_pricing', 'price'], 150),
              currency: getProperty(rate, ['currency'], 'MXN'),
              pickup: getProperty(rate, ['pickup'], false),
              available: true
            };
          });
          return validRates;
        }
        
        // Si tiene datos en formato objeto, convertirlo a array
        if (responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
          console.log("Encontradas tarifas en data (objeto):", responseData.data);
          const rate = responseData.data;
          return [{
            title: getProperty(rate, ['title', 'name', 'service_level.name'], 'Servicio de Envío Estándar'),
            deliveryType: {
              name: getProperty(rate, ['deliveryType.name', 'service_level.name'], 'Estándar'),
              feature: getProperty(rate, ['deliveryType.feature'], 'Entrega a domicilio'),
              description: getProperty(rate, ['deliveryType.description', 'description'], 'Servicio estándar de entrega'),
              company: rate.carrier || rate.provider || getProperty(rate, ['deliveryType.company', 'provider', 'carrier'], 'Paquetería')
            },
            packageSize: getProperty(rate, ['packageSize'], '1'),
            cost: getProperty(rate, ['cost', 'amount', 'total_pricing', 'price'], 150),
            currency: getProperty(rate, ['currency'], 'MXN'),
            pickup: getProperty(rate, ['pickup'], false),
            available: true
          }];
        }
      }
      
      // Si no se encontraron tarifas en los formatos anteriores, crear una tarifa ficticia
      console.log("No se encontraron tarifas para EnviosPerros, creando tarifa ficticia");
      const companyName = "Estafeta";
      return [{
        title: "Servicio de Envío Estándar",
        deliveryType: {
          name: "Estándar",
          company: companyName,
          description: "Servicio estándar de entrega",
          feature: "Entrega a domicilio"
        },
        packageSize: "1",
        cost: 150,
        currency: "MXN",
        pickup: false,
        available: true,
        service: "ESTAFETA_ECONOMICO",
        carrier: companyName,
        provider: companyName
      }];
    }
    
    // Para otros proveedores (EnvioClick)
    console.log("Procesando respuesta para otro proveedor");
    
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
      console.log(`Buscando en ruta '${path}':`, potentialRates);
      
      if (potentialRates) {
        // Si encontramos un array, asumimos que son las tarifas
        if (Array.isArray(potentialRates)) {
          console.log(`Encontradas tarifas en '${path}' (array)`);
          return potentialRates;
        }
        // Si es un objeto con propiedades que parecen tarifas, convertirlo a array
        else if (typeof potentialRates === 'object' && potentialRates !== null) {
          // Verificar si tiene propiedades que parecen ser tarifas (cost, carrier, etc.)
          if ('cost' in potentialRates || 'carrier' in potentialRates || 'service' in potentialRates || 
              'title' in potentialRates || 'deliveryType' in potentialRates || 'amount' in potentialRates ||
              'packageSize' in potentialRates || 'pickup' in potentialRates || 'available' in potentialRates) {
            console.log(`Encontrada tarifa en '${path}' (objeto único)`);
            return [potentialRates];
          }
          
          // Intentar convertir el objeto a un array si sus valores parecen ser tarifas
          const values = Object.values(potentialRates);
          if (values.length > 0 && values.every(v => typeof v === 'object' && v !== null)) {
            console.log(`Encontradas tarifas en '${path}' (valores de objeto)`);
            return values;
          }
        }
      }
    }
    
    console.log(`No se encontraron tarifas para ${shippingProvider}`);
    return [];
  };
      
  // Buscar tarifas usando la función auxiliar
  const rates = findRates(data);
      console.log("Estructura de la respuesta:", JSON.stringify(data, null, 2));
      console.log("Tarifas encontradas:", rates);
      
      // Procesar y normalizar las tarifas encontradas
      const processedRates = rates.map((rate: any) => {
        // Determinar el nombre de la compañía/paquetería
        let companyName = '';
        
        // Primero intentar obtener de carrier o provider directamente
        if (rate.carrier) {
          companyName = rate.carrier;
        } else if (rate.provider) {
          companyName = rate.provider;
        } 
        // Luego intentar obtener de otras propiedades
        else {
          companyName = getProperty(rate, [
            'deliveryType.company', 
            'paqueteria', 
            'carrier', 
            'company',
            'provider'
          ], '');
        }
        
        // Si aún no tenemos un nombre, intentar determinar por el servicio
        if (!companyName && rate.service) {
          const serviceStr = rate.service.toString().toUpperCase();
          if (serviceStr.includes('ESTAFETA')) {
            companyName = 'Estafeta';
          } else if (serviceStr.includes('DHL')) {
            companyName = 'DHL';
          } else if (serviceStr.includes('FEDEX')) {
            companyName = 'FedEx';
          } else if (serviceStr.includes('REDPACK')) {
            companyName = 'RedPack';
          } else if (serviceStr.includes('AMPM')) {
            companyName = 'AM PM';
          }
        }
        
        // Si todavía no tenemos nombre, usar un valor por defecto
        if (!companyName) {
          companyName = 'Paquetería';
        }
        
        return {
          id: getProperty(rate, ['idRate', 'id', 'rate_id'], `rate-${Math.random().toString(36).substring(2, 11)}`),
          cost: getProperty(rate, ['cost', 'total', 'price', 'amount'], 0),
          title: getProperty(rate, ['title', 'deliveryType.name', 'name', 'product', 'service'], 'Servicio de Envío'),
          company: companyName,
          serviceDescription: getProperty(rate, ['deliveryType.description', 'servicio', 'description', 'packageSize'], 'Servicio estándar'),
          deliveryTime: getProperty(rate, ['deliveryType.feature', 'tiempo_entrega', 'estimatedDelivery', 'feature'], 'Consultar con paquetería'),
          isAvailable: getProperty(rate, ['available', 'isAvailable', 'status'], true) !== false,
          currency: getProperty(rate, ['currency'], 'MXN'),
          packageSize: getProperty(rate, ['packageSize'], 'Paquete mediano'),
          pickup: getProperty(rate, ['pickup'], false),
          originalRate: rate,
          // Asegurarse de que estas propiedades estén disponibles para la interfaz
          carrier: rate.carrier || companyName,
          provider: rate.provider || companyName,
          service: rate.service || ''
        };
      });
      
      // Si encontramos tarifas, mostrar la primera para depuración
      if (rates.length > 0) {
        console.log("Primera tarifa encontrada:", rates[0]);
        console.log("Primera tarifa procesada:", processedRates[0]);
      } else {
        // Verificar si la respuesta es exitosa pero sin datos
        if (data.success === true && data.statusCode === 200 && (!data.data || (Array.isArray(data.data) && data.data.length === 0))) {
          console.log("Respuesta exitosa pero sin tarifas disponibles");
          // Crear una tarifa ficticia para mostrar un mensaje al usuario
          const companyName = 'Estafeta';
          processedRates.push({
            id: `rate-${Math.random().toString(36).substring(2, 11)}`,
            title: "Servicio de Envío",
            company: companyName,
            serviceDescription: "Servicio estándar",
            deliveryTime: "Consultar con paquetería",
            cost: 0,
            currency: "MXN",
            packageSize: "Paquete mediano",
            pickup: false,
            isAvailable: true,
            service: 'ESTAFETA_ECONOMICO',
            carrier: companyName,
            provider: companyName,
            originalRate: {
              title: "Servicio de Envío",
              deliveryType: {
                name: "Estándar",
                company: companyName,
                description: "Servicio estándar"
              },
              packageSize: "Paquete mediano",
              cost: 0,
              currency: "MXN",
              pickup: false,
              available: true,
              service: 'ESTAFETA_ECONOMICO',
              carrier: companyName,
              provider: companyName
            }
          });
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
      }
      
      // Usar las tarifas procesadas
       setCotizacion(processedRates.length > 0 ? processedRates : rates);
      
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
    
    // Preparar el payload según el proveedor seleccionado
    let payload;
    let endpoint;
    
    if (shippingProvider === 'envioclick') {
      // Payload para EnvioClick
      payload = {
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
              contentValue: cotizacionPayload.package?.contentValue || 120,
              units: 1
            }
          ]
        },
        origin: {
          company: orderData?.shippingAddress?.company || "Bazar Fashion",
          rfc: orderData?.shippingAddress?.rfc || "XAXX010101000",
          firstName: orderData?.shippingAddress?.name?.split(" ")[0] || "Bazar",
          lastName: orderData?.shippingAddress?.name?.split(" ")[1] || "Fashion",
          email: orderData?.user?.email || "envios@bazarfashion.com",
          phone: orderData?.shippingAddress?.phone || "3336125478",
          street: cotizacionPayload.origin_address || "Av. Revolución",
          number: cotizacionPayload.origin_number || "381",
          intNumber: orderData?.shippingAddress?.intNumber || "Local 5",
          suburb: cotizacionPayload.origin_suburb || "Guadalajara Centro",
          crossStreet: orderData?.shippingAddress?.crossStreet || "Entre Calle Juárez y Calle Hidalgo",
          zipCode: cotizacionPayload.origin_zip_code || "44100",
          reference: orderData?.shippingAddress?.reference || "Tienda de ropa Bazar Fashion",
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
      endpoint = "/api/envioclick/generar-guia";
    } else {
      // Payload para EnviosPerros
      payload = {
        orderId: orderId,
        rateId: getProperty(selectedRate, ['id', 'idRate', 'rate_id']),
        reference: orderId || "Referencia de envío",
        shippingCost: getProperty(selectedRate, ['cost', 'total', 'price', 'amount']) || 0,
        shippingProvider: getProperty(selectedRate, ['carrier', 'deliveryType.company', 'company', 'paqueteria']) || "EnviosPerros",
        selectedRate: selectedRate,
        orderData: orderData,
        originAddress: {
          company: orderData?.shippingAddress?.name || "Bazar Fashion",
          name: orderData?.shippingAddress?.name || "Bazar Fashion",
          email: orderData?.user?.email || "envios@bazarfashion.com",
          phone: orderData?.shippingAddress?.phone || "3336125478",
          street: orderData?.shippingAddress?.street || "Av. Revolución",
          exteriorNumber: orderData?.shippingAddress?.number || "381",
          interiorNumber: orderData?.shippingAddress?.intNumber || "Local 5",
          neighborhood: orderData?.shippingAddress?.neighborhood || "Guadalajara Centro",
          city: orderData?.shippingAddress?.city || "Guadalajara",
          state: orderData?.shippingAddress?.state || "Jalisco",
          postalCode: cotizacionPayload["origin-codePostal"] || "44100",
          references: orderData?.shippingAddress?.reference || "Tienda de ropa Bazar Fashion"
        },
        destinationAddress: {
          company: orderData?.address_to?.name || "Cliente",
          name: orderData?.address_to?.name || "Cliente",
          email: orderData?.address_to?.email || orderData?.user?.email || "cliente@example.com",
          phone: orderData?.address_to?.phone || "3333333333",
          street: orderData?.address_to?.street || "Calzada Lázaro Cárdenas",
          exteriorNumber: orderData?.address_to?.number || "624",
          interiorNumber: orderData?.address_to?.intNumber || "1",
          neighborhood: orderData?.address_to?.neighborhood || "El Santuario",
          city: orderData?.address_to?.city || "Guadalajara",
          state: orderData?.address_to?.state || "Jalisco",
          postalCode: cotizacionPayload["destination-codePostal"] || "44200",
          references: orderData?.address_to?.reference || "Puerta azul"
        },
        packageDetails: {
          weight: cotizacionPayload.weight || 2,
          depth: cotizacionPayload.depth || 30,
          width: cotizacionPayload.width || 20,
          height: cotizacionPayload.height || 15,
          description: "Productos de Bazar Fashion",
          value: orderData?.total || 120
        },
        origin: {
          name: orderData?.shippingAddress?.name || "Bazar Fashion",
          email: orderData?.user?.email || "envios@bazarfashion.com",
          phone: orderData?.shippingAddress?.phone || "3336125478",
          street: orderData?.shippingAddress?.street || "Av. Revolución",
          number: orderData?.shippingAddress?.number || "381",
          intNumber: orderData?.shippingAddress?.intNumber || "Local 5",
          neighborhood: orderData?.shippingAddress?.neighborhood || "Guadalajara Centro",
          city: orderData?.shippingAddress?.city || "Guadalajara",
          state: orderData?.shippingAddress?.state || "Jalisco",
          postalCode: cotizacionPayload["origin-codePostal"] || "44100",
          reference: orderData?.shippingAddress?.reference || "Tienda de ropa Bazar Fashion"
        },
        destination: {
          name: orderData?.address_to?.name || "Cliente",
          email: orderData?.address_to?.email || orderData?.user?.email || "cliente@example.com",
          phone: orderData?.address_to?.phone || "3333333333",
          street: orderData?.address_to?.street || "Calzada Lázaro Cárdenas",
          number: orderData?.address_to?.number || "624",
          intNumber: orderData?.address_to?.intNumber || "1",
          neighborhood: orderData?.address_to?.neighborhood || "El Santuario",
          city: orderData?.address_to?.city || "Guadalajara",
          state: orderData?.address_to?.state || "Jalisco",
          postalCode: cotizacionPayload["destination-codePostal"] || "44200",
          reference: orderData?.address_to?.reference || "Puerta azul"
        }
      };
      endpoint = "/api/enviosperros/generar-guia";
    }

    try {
      toast.loading("Generando etiqueta de envío...");
      console.log("📋 Enviando payload a", endpoint, ":", JSON.stringify(payload, null, 2));
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error en la respuesta:", response.status, errorData);
        throw new Error(errorData.error || `Error al generar la guía (${response.status})`);
      }
      
      let data;
      try {
        data = await response.json();
        console.log("Respuesta completa de generación de guía:", JSON.stringify(data, null, 2));
        console.log("Tipo de respuesta:", typeof data);
        console.log("¿Es objeto vacío?", Object.keys(data).length === 0);
        console.log("Claves disponibles:", Object.keys(data));
      } catch (parseError) {
        console.error("Error al parsear la respuesta JSON:", parseError);
        const responseText = await response.text();
        console.log("Respuesta como texto:", responseText);
        throw new Error("Error al parsear la respuesta del servidor");
      }
      
      // Mostrar información de depuración si está disponible
      if (data.debug) {
        console.log("Información de depuración de la API:", data.debug);
      }
      
      // Busca el PDF en la respuesta usando getProperty con más rutas posibles
      const pdfUrl = getProperty(data, [
        'pdfUrl',
        'pdfBase64',
        'labelUrl', 
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
      
      // Manejar tanto URLs como datos base64
      let finalPdfUrl = pdfUrl;
      if (data.pdfBase64) {
        // Si tenemos datos base64, crear una URL de datos
        const contentType = data.pdfContentType || 'application/pdf';
        
        // Verificar que los datos base64 sean válidos
        try {
          // Intentar decodificar los datos base64 para verificar que sean válidos
          const decodedData = atob(data.pdfBase64);
          console.log("Datos base64 válidos, tamaño decodificado:", decodedData.length);
          
          finalPdfUrl = `data:${contentType};base64,${data.pdfBase64}`;
          console.log("Creando URL de datos desde base64");
          console.log("Tamaño de datos base64:", data.pdfBase64?.length || 0);
          console.log("Content-Type:", contentType);
        } catch (error) {
          console.error("Error al decodificar datos base64:", error);
          finalPdfUrl = null;
        }
      }
      
      setGuiaPdfUrl(finalPdfUrl || null);
      console.log("Estado guiaPdfUrl después de establecerlo:", finalPdfUrl);
      
      if (finalPdfUrl) {
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
            
            // Si encontramos datos base64, crear una URL de datos
            if (key === 'pdfBase64' && typeof value === 'string') {
              const contentType = obj.pdfContentType || 'application/pdf';
              const dataUrl = `data:${contentType};base64,${value}`;
              console.log(`Datos base64 encontrados en ${currentPath}, creando URL de datos`);
              return dataUrl;
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
                Cotizar Envío con {shippingProvider === 'envioclick' ? 'Envío Click' : 'Envíos Perros'}
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

          {/* Selección de proveedor de envío */}
          <div className="mb-3">
            <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-2">
              Proveedor de Envío
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShippingProvider('envioclick')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${shippingProvider === 'envioclick' ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-neutral-100 text-neutral-700 border border-neutral-200'}`}
              >
                Envío Click
              </button>
              <button
                type="button"
                onClick={() => setShippingProvider('enviosperros')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${shippingProvider === 'enviosperros' ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-neutral-100 text-neutral-700 border border-neutral-200'}`}
              >
                Envíos Perros
              </button>
            </div>
          </div>

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
            onClick={cotizarEnvio}
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
                Cotizar con {shippingProvider === 'envioclick' ? 'Envío Click' : 'Envíos Perros'}
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
                  let company = '';
                  
                  // Primero intentar obtener directamente de carrier o provider
                  if (rate.carrier) {
                    company = rate.carrier;
                  } else if (rate.provider) {
                    company = rate.provider;
                  } else {
                    // Luego intentar obtener de otras propiedades
                    company = getProperty(rate, [
                      'deliveryType.company', 
                      'paqueteria', 
                      'carrier',
                      'company',
                      'provider'
                    ]);
                  }
                  
                  // Si aún no tenemos un nombre, intentar determinar por el servicio
                  if (!company && rate.service) {
                    const serviceStr = String(rate.service).toUpperCase();
                    if (serviceStr.includes('ESTAFETA')) {
                      company = 'Estafeta';
                    } else if (serviceStr.includes('DHL')) {
                      company = 'DHL';
                    } else if (serviceStr.includes('FEDEX')) {
                      company = 'FedEx';
                    } else if (serviceStr.includes('REDPACK')) {
                      company = 'RedPack';
                    } else if (serviceStr.includes('AMPM')) {
                      company = 'AM PM';
                    }
                  }
                  
                  // Si todavía no tenemos nombre, usar un valor por defecto
                  if (!company) {
                    company = 'Paquetería';
                  }
                  
                  // Asignar el nombre de la compañía al objeto rate para que esté disponible en la interfaz
                  rate.company = company;
                  
                  // Obtener la descripción del servicio
                  const serviceDescription = getProperty(rate, [
                    'deliveryType.description', 
                    'servicio', 
                    'description',
                    'service',
                    'packageSize',
                    'serviceType',
                    'deliveryType.feature',
                    'feature'
                  ]);
                  
                  // Asignar la descripción del servicio al objeto rate para que esté disponible en la interfaz
                  rate.serviceDescription = serviceDescription || 'Servicio estándar';
                  
                  // Registrar propiedades extraídas para depuración
                  console.log(`Propiedades extraídas para tarifa ${idx}:`, {
                    title,
                    company,
                    serviceDescription,
                    cost,
                    isAvailable,
                    statusDescription,
                    rate: JSON.stringify(rate)
                  });
                  
                  // Obtener el tiempo de entrega
                  const deliveryTime = getProperty(rate, [
                    'deliveryType.feature', 
                    'tiempo_entrega', 
                    'deliveryTime',
                    'estimatedDelivery',
                    'pickup',
                    'deliveryEstimate',
                    'deliveryType.description',
                    'feature',
                    'description'
                  ]);
                  
                  // Registrar tiempo de entrega extraído para depuración
                  console.log(`Tiempo de entrega para tarifa ${idx}:`, {
                    deliveryTime,
                    paths: {
                      'deliveryType.feature': getProperty(rate, ['deliveryType.feature']),
                      'feature': getProperty(rate, ['feature']),
                      'description': getProperty(rate, ['description'])
                    }
                  });
                  
                  console.log(`Tarifa ${idx} - Título: ${title}, Compañía: ${company}, Descripción: ${serviceDescription}, Tiempo: ${deliveryTime}, Costo: ${cost}, Disponible: ${isAvailable}`);
                  
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
                            <span className="font-medium">{rate.company || 'Paquetería'}</span> - {rate.serviceDescription || 'Servicio estándar'}
                          </p>
                          
                          <p className="text-xs sm:text-sm text-neutral-600">
                            ⏱️ Tiempo estimado: {deliveryTime || 'Consultar con paquetería'}
                          </p>
                          
                          <p className="text-xs sm:text-sm text-neutral-600">
                            📦 Tipo: {getProperty(rate, ['deliveryType.name']) || 'Estándar'}
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
            
            <button 
              onClick={() => {
                console.log("Descargando PDF con URL:", guiaPdfUrl);
                if (guiaPdfUrl.startsWith('data:')) {
                  // Para datos base64, crear un blob y descargar
                  const link = document.createElement('a');
                  link.href = guiaPdfUrl;
                  link.download = `guia-envio-${orderId}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  // Para URLs normales, abrir en nueva pestaña
                  window.open(guiaPdfUrl, "_blank");
                }
              }}
              className="btn-primary flex items-center justify-center gap-2 p-2 sm:p-3 text-sm sm:text-base"
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Descargar Etiqueta
            </button>
            
            <button 
              onClick={() => {
                console.log("Abriendo PDF con URL:", guiaPdfUrl);
                if (guiaPdfUrl.startsWith('data:')) {
                  // Para datos base64, abrir en nueva pestaña
                  window.open(guiaPdfUrl, "_blank");
                } else {
                  // Para URLs normales, abrir en nueva pestaña
                  window.open(guiaPdfUrl, "_blank");
                }
              }}
              className="btn-primary flex items-center justify-center gap-2 p-2 sm:p-3 text-sm sm:text-base"
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Ver PDF
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