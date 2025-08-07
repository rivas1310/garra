// Cliente para la API de EnvíosPerros V2
// Implementación basada en la documentación proporcionada

interface EnviosPerrosConfig {
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

interface Parcel {
  depth?: number | string;
  width?: number | string;
  height?: number | string;
  weight?: number | string;
  content?: string;
  value?: number | string;
}

interface Service {
  carrier?: string;
  service_type?: string;
}

interface QuotationPayload {
  depth: number | string;
  width: number | string;
  height: number | string;
  weight?: number | string;
  "origin-codePostal": string;
  "destination-codePostal": string;
}

interface ShippingPayload {
  sender: Address;
  recipient: Address;
  parcel: Parcel;
  service: Service;
  save_origin?: boolean | string;
  ocurre?: boolean | string;
  discount_code?: string;
  metadata?: Record<string, unknown>;
}

interface APIResponse {
  success: boolean;
  data?: Record<string, unknown> | unknown[];
  error?: string;
  statusCode?: number;
  details?: string | Record<string, unknown>;
}

// Catálogo de servicios de paquetería según documentación
const SHIPPING_SERVICES = {
  ESTAFETA: {
    EXPRESS: 'ESTAFETA_EXPRESS',       // Entrega al día siguiente hábil
    ECONOMICO: 'ESTAFETA_ECONOMICO'    // Entrega en 3-5 días hábiles
  },
  REDPACK: {
    EXPRESS: 'EXPRESS',               // Entrega en 1-3 días hábiles
    ECOEXPRESS: 'ECOEXPRESS',          // Entrega en 3-6 días hábiles
    METROPOLITANO: 'METROPOLITANO'      // Mismo día - día siguiente (solo CDMX, GDL, MTY)
  },
  JTEXPRESS: {
    STANDARD: 'STANDARD_JT'           // Entrega en 3-7 días hábiles
  },
  PAQUETEEXPRESS: {
    STANDARD: 'STD-T'                 // Servicio estándar
  }
};

// URLs de tracking según documentación
const TRACKING_URLS = {
  ESTAFETA: 'https://cs.estafeta.com/es/Tracking/searchByGet?wayBill={guia}&wayBillType=0&isShipmentDetail=False',
  JTEXPRESS: 'https://www.jtexpress.mx/trajectoryQuery?waybillNo={guia}&flag=1',
  REDPACK: 'https://www.redpack.com.mx/es/rastreo/?guias={guia}',
  PAQUETEEXPRESS: 'https://www.paquetexpress.com.mx/rastreo/{guia}'
};

export class EnviosPerrosClient {
  private config: EnviosPerrosConfig;

  constructor(config: EnviosPerrosConfig) {
    this.config = config;
  }

  /**
   * Transforma el payload interno al formato requerido por EnvíosPerros
   */
  private transformPayloadToEnviosPerros(payload: ShippingPayload): Record<string, unknown> {
    return {
      // Datos del remitente
      "origin": {
        "company": payload.sender?.company || "Bazar Fashion",
        "street": payload.sender?.street || "",
        "interior_number": payload.sender?.interior_number || "",
        "number": payload.sender?.number || "",
        "postal_code": payload.sender?.postal_code || "",
        "district": payload.sender?.district || "",
        "city": payload.sender?.city || "",
        "state": payload.sender?.state || "",
        "references": payload.sender?.references || "",
        "name": payload.sender?.name || "Bazar Fashion",
        "email": payload.sender?.email || "envios@bazarfashion.com",
        "phone": payload.sender?.phone || ""
      },
      // Datos del destinatario
      "destination": {
        "company": payload.recipient?.company || "Cliente",
        "street": payload.recipient?.street || "",
        "interior_number": payload.recipient?.interior_number || "",
        "number": payload.recipient?.number || "",
        "postal_code": payload.recipient?.postal_code || "",
        "district": payload.recipient?.district || "",
        "city": payload.recipient?.city || "",
        "state": payload.recipient?.state || "",
        "references": payload.recipient?.references || "",
        "name": payload.recipient?.name || "",
        "email": payload.recipient?.email || "",
        "phone": payload.recipient?.phone || ""
      },
      // Datos del paquete
      "package": {
        "depth": payload.parcel?.depth || "20",
        "width": payload.parcel?.width || "30",
        "height": payload.parcel?.height || "10",
        "weight": payload.parcel?.weight || "1",
        "content": payload.parcel?.content || "productos varios",
        "value": payload.parcel?.value || "0"
      },
      // Servicio de envío
      "service": payload.service?.service_type || SHIPPING_SERVICES.ESTAFETA.ECONOMICO,
      // Opciones adicionales
      "save_origin": payload.save_origin || "false",
      "ocurre": payload.ocurre || "false",
      "discount_code": payload.discount_code || ""
    };
  }

  /**
   * Realiza una cotización de envío
   */
  async getShippingRates(payload: QuotationPayload): Promise<APIResponse> {
    try {
      console.log(`📦 Solicitando cotización a EnvíosPerros. Base URL: ${this.config.baseUrl}`);
      console.log('📋 Payload original:', JSON.stringify(payload, null, 2));
      
      // Formato correcto según la documentación de EnviosPerros
      const formattedPayload = {
        depth: typeof payload.depth === 'string' ? parseFloat(payload.depth) : payload.depth,
        width: typeof payload.width === 'string' ? parseFloat(payload.width) : payload.width,
        height: typeof payload.height === 'string' ? parseFloat(payload.height) : payload.height,
        weight: payload.weight ? (typeof payload.weight === 'string' ? parseFloat(payload.weight) : payload.weight) : 1,
        origin: {
          codePostal: payload["origin-codePostal"]
        },
        destination: {
          codePostal: payload["destination-codePostal"]
        }
      };
      
      // Formato alternativo por si el anterior no funciona
      const alternativePayload = {
        depth: typeof payload.depth === 'string' ? parseFloat(payload.depth) : payload.depth,
        width: typeof payload.width === 'string' ? parseFloat(payload.width) : payload.width,
        height: typeof payload.height === 'string' ? parseFloat(payload.height) : payload.height,
        weight: payload.weight ? (typeof payload.weight === 'string' ? parseFloat(payload.weight) : payload.weight) : 1,
        codePostal_origin: payload["origin-codePostal"],
        codePostal_dest: payload["destination-codePostal"]
      };
      
      console.log('📋 Payload alternativo:', JSON.stringify(alternativePayload, null, 2));
      
      console.log('📋 Payload formateado:', JSON.stringify(formattedPayload, null, 2));
      
      const url = `${this.config.baseUrl}/shipping/rates`;
      
      // Intentar con el primer formato
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': this.config.userAgent || 'BazarFashion/1.0'
        },
        body: JSON.stringify(formattedPayload)
      });
      
      // Si la primera solicitud no es exitosa, intentar con el formato alternativo
      if (!response.ok) {
        console.log('⚠️ La primera solicitud no fue exitosa. Intentando con formato alternativo...');
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'User-Agent': this.config.userAgent || 'BazarFashion/1.0'
          },
          body: JSON.stringify(alternativePayload)
        });
      }

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(`❌ Error al parsear JSON:`, e);
        return {
          success: false,
          error: 'Error al parsear respuesta del servidor',
          statusCode: response.status,
          details: responseText
        };
      }

      if (response.ok) {
        return {
          success: true,
          data,
          statusCode: response.status
        };
      } else {
        return {
          success: false,
          error: data.message || 'Error al obtener cotización',
          statusCode: response.status,
          details: data
        };
      }
    } catch (error) {
      console.error('❌ Error al realizar cotización:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
        statusCode: 500
      };
    }
  }

  /**
   * Crea una orden de envío
   */
  async createOrder(payload: any): Promise<APIResponse> {
    try {
      console.log(`📦 Creando orden con EnvíosPerros. Base URL: ${this.config.baseUrl}`);
      console.log('📋 Payload recibido:', JSON.stringify(payload, null, 2));
      
      const url = `${this.config.baseUrl}/orders`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': this.config.userAgent || 'BazarFashion/1.0'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(`❌ Error al parsear JSON:`, e);
        return {
          success: false,
          error: 'Error al parsear respuesta del servidor',
          statusCode: response.status,
          details: responseText
        };
      }

      if (response.ok) {
        return {
          success: true,
          data,
          statusCode: response.status
        };
      } else {
        return {
          success: false,
          error: data.message || 'Error al crear orden',
          statusCode: response.status,
          details: data
        };
      }
    } catch (error) {
      console.error('❌ Error al crear orden:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
        statusCode: 500
      };
    }
  }

  /**
   * Cancela una guía de envío
   */
  async cancelShipment(references: string | string[]): Promise<APIResponse> {
    try {
      const referencesArray = Array.isArray(references) ? references : [references];
      
      console.log(`🚫 Cancelando guía(s) con EnvíosPerros. Base URL: ${this.config.baseUrl}`);
      
      const url = `${this.config.baseUrl}/cancel`;
      const payload = { "referens": referencesArray };
      
      console.log('📋 Payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': this.config.userAgent || 'BazarFashion/1.0'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(`❌ Error al parsear JSON:`, e);
        return {
          success: false,
          error: 'Error al parsear respuesta del servidor',
          statusCode: response.status,
          details: responseText
        };
      }

      if (response.ok) {
        return {
          success: true,
          data,
          statusCode: response.status
        };
      } else {
        return {
          success: false,
          error: data.message || 'Error al cancelar guía',
          statusCode: response.status,
          details: data
        };
      }
    } catch (error) {
      console.error('❌ Error al cancelar guía:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
        statusCode: 500
      };
    }
  }

  /**
   * Genera el PDF de una guía
   */
  async generateLabel(reference: string, asBase64: boolean = false): Promise<APIResponse> {
    try {
      console.log(`🏷️ Generando etiqueta PDF con EnvíosPerros. Base URL: ${this.config.baseUrl}`);
      
      const url = `${this.config.baseUrl}/guide/order?reference=${reference}`;
      
      console.log('📋 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': this.config.userAgent || 'BazarFashion/1.0'
        }
      });

      console.log('📋 Status:', response.status);
      console.log('📋 Content-Type:', response.headers.get('content-type'));

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        // Si es un PDF, devolver los datos binarios
        if (contentType && contentType.includes('application/pdf')) {
          console.log('✅ Respuesta es un PDF');
          
          if (asBase64) {
            // Convertir a base64
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            return {
              success: true,
              data: {
                base64: base64,
                contentType: contentType,
                size: buffer.byteLength
              },
              statusCode: response.status
            };
          } else {
            // Devolver como blob URL
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            return {
              success: true,
              data: {
                url: blobUrl,
                contentType: contentType,
                size: blob.size
              },
              statusCode: response.status
            };
          }
        } else {
          // Intentar parsear como JSON por si acaso
          const responseText = await response.text();
          try {
            const data = JSON.parse(responseText);
            
            // Verificar si el JSON contiene un PDF en base64
            if (Array.isArray(data) && data.length > 0 && data[0].pdf) {
              console.log('✅ PDF encontrado en JSON (base64)');
              const pdfBase64 = data[0].pdf;
              
              if (asBase64) {
                return {
                  success: true,
                  data: {
                    base64: pdfBase64,
                    contentType: 'application/pdf',
                    size: Buffer.from(pdfBase64, 'base64').length
                  },
                  statusCode: response.status
                };
              } else {
                // Convertir base64 a blob URL
                const buffer = Buffer.from(pdfBase64, 'base64');
                const blob = new Blob([buffer], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                
                return {
                  success: true,
                  data: {
                    url: blobUrl,
                    contentType: 'application/pdf',
                    size: buffer.length
                  },
                  statusCode: response.status
                };
              }
            }
            
            // Si no es un PDF, devolver el JSON como está
            return {
              success: true,
              data,
              statusCode: response.status
            };
          } catch (e) {
            console.log('📋 Respuesta no es JSON ni PDF:', responseText.substring(0, 200));
            return {
              success: false,
              error: 'Respuesta inesperada del servidor',
              statusCode: response.status,
              details: responseText.substring(0, 200)
            };
          }
        }
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        return {
          success: false,
          error: errorData.message || 'Error al generar etiqueta',
          statusCode: response.status,
          details: errorData
        };
      }
    } catch (error) {
      console.error('❌ Error al generar etiqueta:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
        statusCode: 500
      };
    }
  }

  /**
   * Solicita la recolección de un paquete
   */
  async requestPickup(reference: string, date: string, time: number): Promise<APIResponse> {
    try {
      console.log(`🚚 Solicitando recolección con EnvíosPerros. Base URL: ${this.config.baseUrl}`);
      
      const url = `${this.config.baseUrl}/pickup`;
      const payload = { 
        "reference": reference,
        "date": date,
        "time": time
      };
      
      console.log('📋 Payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': this.config.userAgent || 'BazarFashion/1.0'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(`❌ Error al parsear JSON:`, e);
        return {
          success: false,
          error: 'Error al parsear respuesta del servidor',
          statusCode: response.status,
          details: responseText
        };
      }

      if (response.ok) {
        return {
          success: true,
          data,
          statusCode: response.status
        };
      } else {
        return {
          success: false,
          error: data.message || 'Error al solicitar recolección',
          statusCode: response.status,
          details: data
        };
      }
    } catch (error) {
      console.error('❌ Error al solicitar recolección:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
        statusCode: 500
      };
    }
  }

  /**
   * Obtiene la URL de seguimiento para una guía
   */
  getTrackingUrl(reference: string, carrier: string): string {
    const carrierUpperCase = carrier.toUpperCase();
    let trackingUrl = '';
    
    // Buscar la URL de tracking para la paquetería
    for (const [key, url] of Object.entries(TRACKING_URLS)) {
      if (key === carrierUpperCase) {
        trackingUrl = url.replace('{guia}', reference);
        break;
      }
    }
    
    if (!trackingUrl) {
      console.warn(`⚠️ No se encontró URL de tracking para la paquetería: ${carrier}`);
      return '';
    }
    
    return trackingUrl;
  }
}

// Exportar constantes útiles
export { SHIPPING_SERVICES, TRACKING_URLS };