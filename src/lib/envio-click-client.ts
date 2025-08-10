// Cliente robusto para la API de Envío Click con sistema de fallback
// Este archivo implementa un sistema que prueba múltiples endpoints automáticamente

interface EnvioClickConfig {
  baseUrl: string;
  apiKey: string;
  userAgent?: string;
}

interface Address {
  company?: string;
  street?: string;
  interior_number?: string;
  number?: string;
  postal_code?: string;
  district?: string;
  city?: string;
  state?: string;
  references?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface AlternativeAddress {
  company?: string;
  street?: string;
  interior_number?: string;
  number?: string;
  postalCode?: string;
  district?: string;
  city?: string;
  state?: string;
  references?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface Parcel {
  type?: string;
  depth?: number | string;
  width?: number | string;
  height?: number | string;
  weight?: number | string;
  content?: string;
}

interface Service {
  carrier?: string;
}

interface SelectedRate {
  deliveryType?: {
    company?: string;
  };
}

interface QuotationPayload {
  origin_address?: string;
  origin_number?: string;
  origin_zip_code?: string;
  origin_suburb?: string;
  destination_address?: string;
  destination_number?: string;
  destination_zip_code?: string;
  destination_suburb?: string;
  package?: {
    description?: string;
    contentValue?: number | string;
    weight?: number | string;
    length?: number | string;
    height?: number | string;
    width?: number | string;
  };
}

interface ShippingPayload {
  // Formato original
  sender?: Address;
  recipient?: Address;
  
  // Formato alternativo
  address_from?: Address;
  address_to?: Address;
  addressFrom?: AlternativeAddress;
  addressTo?: AlternativeAddress;
  
  parcel: Parcel;
  service?: Service;
  selectedRate?: SelectedRate;
  metadata?: Record<string, unknown>;
}

interface APIResponse {
  success: boolean;
  data?: Record<string, unknown> | unknown[];
  error?: string;
  endpoint?: string;
  statusCode?: number;
  details?: string | Record<string, unknown>; // Añadido para soportar detalles adicionales de error
}

// Endpoints posibles para crear órdenes/etiquetas
const CREATE_ORDER_ENDPOINTS = [
  // Primero intentamos con los endpoints v2
  '/api/v2/order',      // Endpoint v2 principal según documentación actualizada
  '/api/v2/orders',     // Endpoint v2 plural
  '/api/v2/labels',     // Endpoint v2 para etiquetas
  '/api/v2/shipments',  // Endpoint v2 para envíos
  
  // Luego intentamos con los endpoints v1 conocidos
  '/labels',            // Endpoint confirmado como funcional (200 OK)
  '/api/v1/orders',     // Endpoint confirmado por Insomnia
  '/api/v1/order',      // Endpoint v1 singular
  '/api/v1',            // Endpoint principal según Insomnia
  
  // Finalmente intentamos con endpoints genéricos
  '/orders',            // Endpoint estándar para órdenes
  '/order',             // Endpoint singular
  '/shipments',         // Endpoint estándar para envíos
  '/envios',            // Posible endpoint en español
  '/shipping/orders',   // Variante del endpoint original
  '/api/orders',        // Variante con prefijo api
  '/create-shipment',   // Variante descriptiva
  '/shipping/labels'    // Variante para etiquetas
]

// Lista de endpoints posibles para tracking
const TRACKING_ENDPOINTS = [
  // Primero intentamos con los endpoints v2
  '/api/v2/guide/order',   // Endpoint v2 de guía (confirmado como funcional en producción)
  '/api/v2/track',         // Endpoint v2 simple
  '/api/v2/tracking',      // Endpoint v2 variante
  
  // Luego intentamos con los endpoints v1 conocidos
  '/api/v1/guide/order',   // Endpoint confirmado por Insomnia (Guía)
  '/api/v1/track',         // Endpoint v1 simple
  '/api/v1/tracking',      // Endpoint v1 variante
  
  // Finalmente intentamos con endpoints genéricos
  '/guide/order',          // Endpoint de guía sin prefijo
  '/track',                // Endpoint simple
  '/tracking',             // Variante de tracking
  '/shipments/{id}/track', // Endpoint RESTful
  '/orders/{id}/track',    // Variante con orders
  '/envios/{id}/track',    // Variante en español
  '/shipping/track'        // Variante con prefijo
];

// Lista de endpoints posibles para cotización individual
const QUOTATION_ENDPOINTS = [
  // Endpoint oficial según documentación
  '/api/v2/quotation'
];

export class EnvioClickClient {
  private config: EnvioClickConfig;
  private successfulEndpoints: Map<string, string> = new Map();

  constructor(config: EnvioClickConfig) {
    this.config = config;
  }

  /**
   * Transforma el payload interno al formato requerido por Envío Click
   */
  private transformPayloadToEnvioClick(payload: ShippingPayload): Record<string, unknown> {
    return {
      deliveryType: payload.service?.carrier || payload.selectedRate?.deliveryType?.company || "ESTANDAR",
      packageSize: {
        type: payload.parcel?.type || "paquete",
        depth: payload.parcel?.depth?.toString() || "20",
        width: payload.parcel?.width?.toString() || "30",
        height: payload.parcel?.height?.toString() || "10",
        weight: payload.parcel?.weight?.toString() || "1",
        description: payload.parcel?.content || "productos varios"
      },
      origin: {
        company_origin: payload.address_from?.company || payload.addressFrom?.company || "Garras Felinas",
        street_origin: payload.address_from?.street || payload.addressFrom?.street || "Prolongación 20 de Noviembre",
        interior_number_origin: payload.address_from?.interior_number || payload.addressFrom?.interior_number || "",
        outdoor_number_origin: payload.address_from?.number || payload.addressFrom?.number || "224",
        zip_code_origin: payload.address_from?.postal_code || payload.addressFrom?.postalCode || "45100",
        neighborhood_origin: payload.address_from?.district || payload.addressFrom?.district || "Zapopan Centro",
        city_origin: payload.address_from?.city || payload.addressFrom?.city || "Zapopan",
        state_origin: payload.address_from?.state || payload.addressFrom?.state || "Jalisco",
        references_origin: payload.address_from?.references || payload.addressFrom?.references || "Tienda Garras Felinas",
        name_origin: payload.address_from?.name || payload.addressFrom?.name || "Garras Felinas",
        email_origin: payload.address_from?.email || payload.addressFrom?.email || "envios@garrasfelinas.com",
        phone_origin: payload.address_from?.phone || payload.addressFrom?.phone || "3327432497",
        save_origin: "false"
      },
      destination: {
        company_dest: payload.address_to?.company || payload.addressTo?.company || "Cliente",
        street_dest: payload.address_to?.street || payload.addressTo?.street || "",
        interior_number_dest: payload.address_to?.interior_number || payload.addressTo?.interior_number || "",
        outdoor_number_dest: payload.address_to?.number || payload.addressTo?.number || "",
        zip_code_dest: payload.address_to?.postal_code || payload.addressTo?.postalCode || "",
        neighborhood_dest: payload.address_to?.district || payload.addressTo?.district || "",
        city_dest: payload.address_to?.city || payload.addressTo?.city || "",
        state_dest: payload.address_to?.state || payload.addressTo?.state || "",
        references_dest: payload.address_to?.references || payload.addressTo?.references || "",
        name_dest: payload.address_to?.name || payload.addressTo?.name || "",
        email_dest: payload.address_to?.email || payload.addressTo?.email || "",
        phone_dest: payload.address_to?.phone || payload.addressTo?.phone || "",
        save_dest: "false",
        ocurre: "false"
      }
    };
  }

  /**
   * Intenta crear una orden/etiqueta probando múltiples endpoints
   */
  async createOrder(payload: ShippingPayload): Promise<APIResponse> {
    // Transformar el payload al formato requerido por Envíos Perros
    const transformedPayload = this.transformPayloadToEnvioClick(payload);
    
    console.log(`📦 Intentando crear etiqueta con Envío Click. Base URL: ${this.config.baseUrl}`);
    console.log('📋 Payload transformado:', JSON.stringify(transformedPayload, null, 2));
    
    // Si ya conocemos un endpoint exitoso, usarlo primero
    const knownEndpoint = this.successfulEndpoints.get('createOrder');
    if (knownEndpoint) {
      console.log(`🔄 Intentando endpoint conocido: ${knownEndpoint}`);
      const result = await this.tryEndpoint(knownEndpoint, transformedPayload, 'POST');
      if (result.success) {
        console.log(`✅ Etiqueta creada exitosamente con endpoint conocido: ${knownEndpoint}`);
        return result;
      }
      // Si falla, remover de endpoints conocidos y continuar con fallback
      console.log(`❌ El endpoint conocido ${knownEndpoint} falló: ${result.error}. Código: ${result.statusCode}`);
      this.successfulEndpoints.delete('createOrder');
    }

    // Probar todos los endpoints posibles
    let allErrors = [];
    for (const endpoint of CREATE_ORDER_ENDPOINTS) {
      console.log(`🔄 Probando endpoint: ${endpoint}`);
      
      const result = await this.tryEndpoint(endpoint, transformedPayload, 'POST');
      
      if (result.success) {
        // Guardar endpoint exitoso para futuras llamadas
        this.successfulEndpoints.set('createOrder', endpoint);
        console.log(`✅ Endpoint exitoso encontrado: ${endpoint}`);
        return result;
      }
      
      // Guardamos información detallada del error
      allErrors.push({
        endpoint,
        error: result.error,
        statusCode: result.statusCode
      });
      
      console.log(`❌ Endpoint ${endpoint} falló: ${result.error}. Código: ${result.statusCode}`);
      
      // Pequeña pausa entre intentos para evitar rate limiting
      await this.delay(100);
    }

    // Creamos un mensaje de error detallado
    const errorDetails = allErrors.map(e => `${e.endpoint}: ${e.statusCode} - ${e.error}`).join('\n');
    console.error(`❌❌❌ Todos los endpoints fallaron. Detalles:\n${errorDetails}`);
    
    return {
      success: false,
      error: 'Ningún endpoint de creación de órdenes funcionó. Contactar soporte técnico de Envío Click.',
      statusCode: 404,
      details: errorDetails
    };
  }

  /**
   * Intenta hacer tracking probando múltiples endpoints
   */
  async trackShipment(trackingNumber: string): Promise<APIResponse> {
    const knownEndpoint = this.successfulEndpoints.get('tracking');
    if (knownEndpoint) {
      // Si el endpoint conocido es el de guía, necesitamos un payload especial
      if (knownEndpoint.includes('guide/order')) {
        const payload = { reference: trackingNumber };
        const result = await this.tryEndpoint(knownEndpoint, payload, 'GET');
        if (result.success) {
          return result;
        }
      } else {
        const endpoint = knownEndpoint.replace('{id}', trackingNumber);
        const result = await this.tryEndpoint(endpoint, null, 'GET');
        if (result.success) {
          return result;
        }
      }
      this.successfulEndpoints.delete('tracking');
    }

    // Primero intentamos con los endpoints que requieren payload
    const guideEndpoints = TRACKING_ENDPOINTS.filter(e => e.includes('guide/order'));
    for (const endpoint of guideEndpoints) {
      console.log(`🔄 Probando endpoint de guía: ${endpoint}`);
      const payload = { reference: trackingNumber };
      const result = await this.tryEndpoint(endpoint, payload, 'GET');
      
      if (result.success) {
        this.successfulEndpoints.set('tracking', endpoint);
        console.log(`✅ Endpoint de guía exitoso: ${endpoint}`);
        return result;
      }
      
      console.log(`❌ Endpoint de guía ${endpoint} falló: ${result.error}`);
      await this.delay(100);
    }

    // Luego intentamos con los endpoints estándar
    const standardEndpoints = TRACKING_ENDPOINTS.filter(e => !e.includes('guide/order'));
    for (const endpointTemplate of standardEndpoints) {
      const endpoint = endpointTemplate.replace('{id}', trackingNumber);
      console.log(`🔄 Probando endpoint de tracking: ${endpoint}`);
      
      const result = await this.tryEndpoint(endpoint, null, 'GET');
      
      if (result.success) {
        this.successfulEndpoints.set('tracking', endpointTemplate);
        console.log(`✅ Endpoint de tracking exitoso: ${endpoint}`);
        return result;
      }
      
      console.log(`❌ Endpoint de tracking ${endpoint} falló: ${result.error}`);
      await this.delay(100);
    }

    return {
      success: false,
      error: 'Ningún endpoint de tracking funcionó. Contactar soporte técnico de Envío Click.',
      statusCode: 404
    };
  }

  /**
   * Prueba un endpoint específico
   */
  private async tryEndpoint(
    endpoint: string, 
    payload: Record<string, unknown> | null, 
    method: 'GET' | 'POST'
  ): Promise<APIResponse> {
    try {
      let url = `${this.config.baseUrl}${endpoint}`;
      
      // Para GET con payload, añadimos los parámetros a la URL
      if (method === 'GET' && payload) {
        // Si es el endpoint de guía, necesitamos enviar el payload en el body
        if (endpoint.includes('guide/order')) {
          console.log(`🔍 Intentando ${method} con payload a: ${url}`);
        } else {
          // Para otros endpoints GET, convertimos el payload a query params
          const params = new URLSearchParams();
          Object.entries(payload).forEach(([key, value]) => {
            params.append(key, String(value));
          });
          url = `${url}?${params.toString()}`;
        }
      }
      
      console.log(`🔍 Intentando ${method} a: ${url}`);
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey, // EnvíoClick requiere la API Key directa, sin 'Bearer '
          'User-Agent': this.config.userAgent || 'EcUserAgent-2/75082',
        },
      };

      // Añadimos el payload al body para POST o para GET con guide/order
      if ((method === 'POST' || (method === 'GET' && endpoint.includes('guide/order'))) && payload) {
        options.body = JSON.stringify(payload);
      }

      const response = await fetch(url, options);
      console.log(`📡 Respuesta de ${url}: ${response.status} ${response.statusText}`);
      
      // Intentamos obtener el cuerpo de la respuesta como texto primero
      const responseText = await response.text();
      
      // Log extra para depuración
      console.log(`🔎 Cuerpo de respuesta de ${url}:`, responseText);
      
      // Intentamos parsear el texto como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(`❌ Error al parsear JSON de ${url}:`, e);
        
        // Verificamos si la respuesta parece ser HTML
        const isHtml = responseText.trim().startsWith('<!') || responseText.includes('<html');
        if (isHtml) {
          console.log(`📄 Respuesta HTML recibida de ${url} (primeros 100 caracteres): ${responseText.substring(0, 100)}...`);
          data = { 
            error: 'Respuesta HTML recibida en lugar de JSON', 
            isHtml: true,
            htmlLength: responseText.length,
            snippet: responseText.substring(0, 100) 
          };
        } else {
          console.log(`📄 Respuesta no-JSON recibida: ${responseText}`);
          data = { error: 'Error al parsear respuesta JSON', rawResponse: responseText };
        }
      }

      // Verificamos si la respuesta fue exitosa
      if (response.ok) {
        // Verificamos si el cuerpo de la respuesta indica un error a pesar del código HTTP 200
        if (data && typeof data === 'object' && (data.error || data.message)) {
          const errorMessage = data.error || data.message || 'Error en la respuesta';
          console.error(`❌ Error en respuesta de ${url} (${response.status}): ${errorMessage}`);
          
          return {
            success: false,
            error: errorMessage,
            data,  // Incluimos los datos para análisis
            endpoint,
            statusCode: response.status
          };
        }
        
        console.log(`✅ Respuesta exitosa de ${endpoint}`);
        return {
          success: true,
          data,
          endpoint,
          statusCode: response.status
        };
      } else {
        // Analizamos el error con más detalle
        const errorMessage = data.message || data.error || response.statusText || 'Error desconocido';
        console.error(`❌ Error en ${url} (${response.status}): ${errorMessage}`);
        console.log(`📄 Detalles de la respuesta:`, data);
        
        return {
          success: false,
          error: errorMessage,
          data,  // Incluimos los datos para análisis
          endpoint,
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error(`❌ Excepción al llamar ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        endpoint,
        statusCode: 0
      };
    }
  }

  /**
   * Pausa la ejecución por el tiempo especificado
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene los endpoints exitosos conocidos
   */
  getSuccessfulEndpoints(): Record<string, string> {
    return Object.fromEntries(this.successfulEndpoints);
  }

  /**
   * Limpia la caché de endpoints exitosos
   */
  clearEndpointCache(): void {
    this.successfulEndpoints.clear();
  }

  /**
   * Obtiene cotización individual usando el nuevo endpoint oficial
   */
  async getIndividualQuotation(payload: QuotationPayload): Promise<APIResponse> {
    // Transformamos el payload al formato esperado por la API de Envío Click
    const transformedPayload = this.transformPayloadForQuotation(payload);
    console.log('📋 Payload transformado para cotización:', JSON.stringify(transformedPayload, null, 2));
    
    const knownEndpoint = this.successfulEndpoints.get('quotation');
    if (knownEndpoint) {
      console.log(`🔄 Intentando endpoint conocido para cotización individual: ${knownEndpoint}`);
      const result = await this.tryEndpoint(knownEndpoint, transformedPayload, 'POST');
      if (
        result.success &&
        result.data &&
        (
          (typeof result.data === 'object' && !Array.isArray(result.data) && (!('isHtml' in result.data) || !(result.data as any).isHtml))
          ||
          (Array.isArray(result.data))
        )
      ) {
        console.log(`✅ Cotización individual obtenida exitosamente con endpoint conocido: ${knownEndpoint}`);
        return result;
      }
      console.log(`❌ El endpoint conocido ${knownEndpoint} falló: ${result.error || 'Respuesta HTML recibida'}. Código: ${result.statusCode}`);
      this.successfulEndpoints.delete('quotation');
    }

    let allErrors = [];
    for (const endpoint of QUOTATION_ENDPOINTS) {
      console.log(`🔄 Probando endpoint de cotización individual: ${endpoint}`);
      
      const result = await this.tryEndpoint(endpoint, transformedPayload, 'POST');
      
      // Verificamos si la respuesta es exitosa y contiene datos válidos
      if (result.success && result.data) {
        // Verificamos si la respuesta es un array (formato esperado para cotizaciones)
        if (Array.isArray(result.data)) {
          this.successfulEndpoints.set('quotation', endpoint);
          console.log(`✅ Endpoint de cotización individual exitoso (formato array): ${endpoint}`);
          return result;
        }
        
        // Verificamos si es el formato API V2 (objeto con data.rates)
        if (typeof result.data === 'object' && 'data' in result.data && 
            result.data.data !== null && typeof result.data.data === 'object' && 
            'rates' in result.data.data && Array.isArray(result.data.data.rates)) {
          this.successfulEndpoints.set('quotation', endpoint);
          console.log(`✅ Endpoint de cotización individual exitoso (formato API V2): ${endpoint}`);
          return result;
        }
        
        // Verificamos si es un objeto con rates directamente
        if (typeof result.data === 'object' && 'rates' in result.data && 
            Array.isArray(result.data.rates)) {
          this.successfulEndpoints.set('quotation', endpoint);
          console.log(`✅ Endpoint de cotización individual exitoso (formato con rates): ${endpoint}`);
          return result;
        }
        
        // Si no es ninguno de los formatos anteriores pero tampoco es HTML, podría ser otro formato válido
        if (typeof result.data === 'object' && !('isHtml' in result.data) && !result.data.error) {
          this.successfulEndpoints.set('quotation', endpoint);
          console.log(`✅ Endpoint de cotización individual exitoso (formato no estándar): ${endpoint}`);
          return result;
        }
      }
      
      // Si recibimos HTML, es probable que sea una página de login o error
      const errorMessage = (result.data && typeof result.data === 'object' && 'isHtml' in result.data && result.data.isHtml)
        ? 'Respuesta HTML recibida (posible redirección a login)'
        : (result.error || 'Error desconocido');
      
      // Guardamos información detallada del error
      allErrors.push({
        endpoint,
        error: errorMessage,
        statusCode: result.statusCode,
        isHtml: (result.data && typeof result.data === 'object' && 'isHtml' in result.data) ? result.data.isHtml : false
      });
      
      console.log(`❌ Endpoint de cotización individual ${endpoint} falló: ${errorMessage}. Código: ${result.statusCode}`);
      await this.delay(100);
    }

    // Creamos un mensaje de error detallado
    const errorDetails = allErrors.map(e => `${e.endpoint}: ${e.statusCode} - ${e.error}${e.isHtml ? ' (HTML)' : ''}`).join('\n');
    console.error(`❌❌❌ Todos los endpoints de cotización individual fallaron. Detalles:\n${errorDetails}`);
    
    // Si todos los endpoints devolvieron HTML, es probable que necesitemos autenticación
    const allHtmlResponses = allErrors.every(e => e.isHtml);
    
    return {
      success: false,
      error: allHtmlResponses 
        ? 'Se recibieron respuestas HTML en todos los endpoints. Es probable que se requiera autenticación o que las URLs no sean correctas.' 
        : 'Ningún endpoint de cotización individual funcionó. Contactar soporte técnico de Envío Click.',
      statusCode: allErrors.length > 0 ? allErrors[0].statusCode : 401, // Usamos el código de estado del primer error o 401 por defecto
      details: errorDetails
    };
  }

  /**
   * Transforma el payload de cotización al formato esperado por la API
   */
  private transformPayloadForQuotation(payload: QuotationPayload): Record<string, unknown> {

    // Transformamos el payload al formato que espera la API de Envío Click
    const result: Record<string, unknown> = {
      origin_address: payload.origin_address,
      origin_number: payload.origin_number,
      origin_zip_code: payload.origin_zip_code,
      origin_suburb: payload.origin_suburb,
      destination_address: payload.destination_address,
      destination_number: payload.destination_number,
      destination_zip_code: payload.destination_zip_code,
      destination_suburb: payload.destination_suburb
    };
    
    // Solo agregamos el paquete si existe
    if (payload.package) {
      result.package = {
        description: payload.package.description,
        contentValue: payload.package.contentValue,
        weight: payload.package.weight,
        length: payload.package.length,
        height: payload.package.height,
        width: payload.package.width
      };
    }
    
    return result;
  }

  /**
   * Obtiene cotizaciones de envío
   */
  /**
   * Transforma el payload para cotizaciones según su tipo
   */
  private transformPayloadForShippingRates(payload: ShippingPayload | QuotationPayload): Record<string, unknown> {
    // Verificamos si es un QuotationPayload (tiene origin_address)
    if ('origin_address' in payload) {
      return this.transformPayloadForQuotation(payload as QuotationPayload);
    } 
    // Si es un ShippingPayload
    else {
      return this.transformPayloadToEnvioClick(payload as ShippingPayload);
    }
  }

  async getShippingRates(payload: ShippingPayload | QuotationPayload): Promise<APIResponse> {
    // Transformamos el payload al formato esperado
    const transformedPayload = this.transformPayloadForShippingRates(payload);
    
    const knownEndpoint = this.successfulEndpoints.get('rates');
    if (knownEndpoint) {
      console.log(`🔄 Intentando endpoint conocido para cotizaciones: ${knownEndpoint}`);
      const result = await this.tryEndpoint(knownEndpoint, transformedPayload, 'POST');
      if (result.success) {
        console.log(`✅ Cotización obtenida exitosamente con endpoint conocido: ${knownEndpoint}`);
        return result;
      }
      console.log(`❌ El endpoint conocido ${knownEndpoint} falló: ${result.error}. Código: ${result.statusCode}`);
      this.successfulEndpoints.delete('rates');
    }

    const ratesEndpoints = [
      // Primero intentamos con los endpoints v2
      '/api/v2/shipping/rates', // Endpoint v2 principal (confirmado como funcional en staging)
      '/api/v2/rates',          // Variante v2
      
      // Luego intentamos con los endpoints v1 conocidos
      '/api/v1/shipping/rates', // Endpoint confirmado por Insomnia
      '/api/v1/rates',          // Variante v1
      
      // Finalmente intentamos con endpoints genéricos
      '/shipping/rates',        // Endpoint sin versión
      '/rates',                 // Endpoint simple
      '/quotes',                // Alternativa en inglés
      '/shipping/quotes',       // Variante con prefijo
      '/cotizaciones'           // Alternativa en español
    ];

    let allErrors = [];
    for (const endpoint of ratesEndpoints) {
      console.log(`🔄 Probando endpoint de cotizaciones: ${endpoint}`);
      
      const result = await this.tryEndpoint(endpoint, transformedPayload, 'POST');
      
      if (result.success) {
        this.successfulEndpoints.set('rates', endpoint);
        console.log(`✅ Endpoint de cotizaciones exitoso: ${endpoint}`);
        return result;
      }
      
      // Guardamos información detallada del error
      allErrors.push({
        endpoint,
        error: result.error,
        statusCode: result.statusCode
      });
      
      console.log(`❌ Endpoint de cotizaciones ${endpoint} falló: ${result.error}. Código: ${result.statusCode}`);
      await this.delay(100);
    }

    // Creamos un mensaje de error detallado
    const errorDetails = allErrors.map(e => `${e.endpoint}: ${e.statusCode} - ${e.error}`).join('\n');
    console.error(`❌❌❌ Todos los endpoints de cotizaciones fallaron. Detalles:\n${errorDetails}`);
    
    return {
      success: false,
      error: 'Ningún endpoint de cotizaciones funcionó. Contactar soporte técnico de Envío Click.',
      statusCode: 404,
      details: errorDetails
    };
  }

  /**
   * Prueba la conectividad con la API y verifica los endpoints principales
   */
  async healthCheck(): Promise<APIResponse> {
    console.log(`🔍 Verificando conectividad con Envío Click en ${this.config.baseUrl}`);
    
    try {
      // Primero verificamos la conectividad básica
      const response = await fetch(this.config.baseUrl, {
        method: 'GET',
        headers: {
          'Authorization': this.config.apiKey, // EnvíoClick requiere la API Key directa, sin 'Bearer '
        },
      });

      console.log(`📡 Respuesta base: ${response.status} ${response.statusText}`);
      
      // Verificamos los endpoints principales para creación de etiquetas y tracking
      // Priorizamos los endpoints v2 que hemos confirmado como funcionales
      const endpointsToCheck = [
        // Endpoints v2 confirmados
        '/api/v2/shipping/rates',  // Confirmado funcional en staging
        '/api/v2/guide/order',     // Confirmado funcional en producción
        
        // Otros endpoints v2
        '/api/v2/order',
        '/api/v2/orders',
        '/api/v2/labels',
        
        // Endpoints v1 conocidos
        '/api/v1/orders',
        '/api/v1',
        '/labels'
      ];
      
// Definir un tipo para los resultados de los endpoints
interface EndpointResult {
  status?: number;
  statusText?: string;
  available: boolean;
  version: string;
  error?: string;
}
      
      const endpointResults: Record<string, EndpointResult> = {};
      
      for (const endpoint of endpointsToCheck) {
        try {
          const endpointUrl = `${this.config.baseUrl}${endpoint}`;
          console.log(`🔍 Verificando endpoint: ${endpointUrl}`);
          
          const endpointResponse = await fetch(endpointUrl, {
            method: 'HEAD', // Usamos HEAD para no transferir datos innecesarios
            headers: {
              'Authorization': this.config.apiKey, // EnvíoClick requiere la API Key directa, sin 'Bearer '
            },
            // Timeout de 3 segundos para cada endpoint
            signal: AbortSignal.timeout(3000)
          });
          
          endpointResults[endpoint] = {
            status: endpointResponse.status,
            statusText: endpointResponse.statusText,
            available: endpointResponse.status !== 404,
            version: endpoint.includes('/api/v2/') ? 'v2' : 'v1'
          };
          
          console.log(`📡 Endpoint ${endpoint}: ${endpointResponse.status} ${endpointResponse.statusText}`);
        } catch (endpointError) {
          endpointResults[endpoint] = {
            error: endpointError instanceof Error ? endpointError.message : 'Error desconocido',
            available: false,
            version: endpoint.includes('/api/v2/') ? 'v2' : 'v1'
          };
          console.error(`❌ Error al verificar ${endpoint}:`, endpointError);
        }
      }
      
      // Verificamos si al menos un endpoint está disponible
      const anyEndpointAvailable = Object.values(endpointResults).some(
        (result: EndpointResult) => result.available
      );
      
      // Verificamos si hay endpoints v2 disponibles
      const v2EndpointsAvailable = Object.entries(endpointResults).some(
        ([endpoint, result]: [string, EndpointResult]) => result.available && endpoint.includes('/api/v2/')
      );
      
      // Identificamos los endpoints v2 disponibles con detalles
      const availableV2Endpoints = Object.entries(endpointResults)
        .filter(([endpoint, result]: [string, EndpointResult]) => result.available && endpoint.includes('/api/v2/'))
        .map(([endpoint]) => endpoint);
      
      // Detalles completos de endpoints v2 (incluyendo los no disponibles)
      const v2EndpointsDetails = Object.entries(endpointResults)
        .filter(([endpoint]: [string, EndpointResult]) => endpoint.includes('/api/v2/'))
        .reduce((acc, [endpoint, result]) => {
          acc[endpoint] = result;
          return acc;
        }, {} as Record<string, EndpointResult>);
      
      // Identificamos los endpoints v1 disponibles
      const availableV1Endpoints = Object.entries(endpointResults)
        .filter(([endpoint, result]: [string, EndpointResult]) => result.available && !endpoint.includes('/api/v2/'))
        .map(([endpoint]) => endpoint);
        
      // Detalles completos de endpoints v1 (incluyendo los no disponibles)
      const v1EndpointsDetails = Object.entries(endpointResults)
        .filter(([endpoint]: [string, EndpointResult]) => !endpoint.includes('/api/v2/'))
        .reduce((acc, [endpoint, result]) => {
          acc[endpoint] = result;
          return acc;
        }, {} as Record<string, EndpointResult>);
      
      return {
        success: response.ok && anyEndpointAvailable,
        data: { 
          baseStatus: { status: response.status, statusText: response.statusText },
          endpoints: endpointResults,
          v2Available: v2EndpointsAvailable,
          availableV2Endpoints,
          availableV1Endpoints,
          anyEndpointAvailable,
          v2EndpointsDetails,
          v1EndpointsDetails,
          apiVersionSummary: {
            v1: {
              available: availableV1Endpoints.length > 0,
              endpointCount: availableV1Endpoints.length,
              endpoints: availableV1Endpoints
            },
            v2: {
              available: v2EndpointsAvailable,
              endpointCount: availableV2Endpoints.length,
              endpoints: availableV2Endpoints,
              isComplete: availableV2Endpoints.length >= 5 // Consideramos completa si hay al menos 5 endpoints v2 disponibles
            }
          }
        },
        statusCode: response.status
      };
    } catch (error) {
      console.error('❌ Error de conectividad con Envío Click:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conectividad',
        statusCode: 0
      };
    }
  }
}

// Función helper para crear una instancia del cliente
export function createEnvioClickClient(): EnvioClickClient {
  // Usamos siempre la URL de producción oficial
  const baseUrl = "https://api.envioclickpro.com";
  const apiKey = process.env.ENVIOCLICK_API_KEY;
  const userAgent = process.env.ENVIOCLICK_USER_AGENT || "EcUserAgent-2/75082";

  if (!apiKey) {
    throw new Error('ENVIOCLICK_API_KEY no está configurado en las variables de entorno');
  }

  console.log(`🔌 Conectando a Envíos Click en: ${baseUrl}`);
  console.log(`🔑 Usando API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
  return new EnvioClickClient({ baseUrl, apiKey, userAgent });
}

// Exportar tipos para uso en otros archivos
export type { EnvioClickConfig, ShippingPayload, APIResponse };