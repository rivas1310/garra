// Servicio unificado para gestión de envíos
// Este archivo proporciona una interfaz común para trabajar con múltiples proveedores de envío

import { EnvioClickClient } from './envio-click-client';
import { log } from '@/lib/secureLogger'
import { EnviosPerrosClient, SHIPPING_SERVICES as ENVIOSPERROS_SERVICES } from './envios-perros-client';
import { envioClickConfig, enviosPerrosConfig, getShippingService } from './envios-config';

// Interfaces comunes para ambos servicios
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

interface ShippingQuoteRequest {
  origin_postal_code: string;
  destination_postal_code: string;
  parcel: Parcel;
}

interface ShippingOrderRequest {
  sender: Address;
  recipient: Address;
  parcel: Parcel;
  service_type?: string;
  metadata?: Record<string, unknown>;
}

interface ShippingQuoteResult {
  success: boolean;
  quotes?: Array<{
    carrier: string;
    service: string;
    price: number;
    currency: string;
    estimated_delivery: string;
    available: boolean;
  }>;
  error?: string;
  provider?: 'envioclick' | 'enviosperros';
}

interface ShippingOrderResult {
  success: boolean;
  tracking_number?: string;
  label_url?: string;
  carrier?: string;
  service?: string;
  price?: number;
  estimated_delivery?: string;
  error?: string;
  provider?: 'envioclick' | 'enviosperros';
}

/**
 * Clase que proporciona una interfaz unificada para trabajar con múltiples
 * proveedores de servicios de envío
 */
export class ShippingService {
  private envioClickClient: EnvioClickClient;
  private enviosPerrosClient: EnviosPerrosClient;

  constructor() {
    // Inicializar clientes de servicios de envío
    this.envioClickClient = new EnvioClickClient(envioClickConfig);
    this.enviosPerrosClient = new EnviosPerrosClient(enviosPerrosConfig);
  }

  /**
   * Obtiene cotizaciones de envío del proveedor más adecuado
   */
  async getShippingQuotes(request: ShippingQuoteRequest): Promise<ShippingQuoteResult> {
    try {
      // Determinar qué servicio usar basado en la configuración
      const service = getShippingService(
        request.origin_postal_code,
        request.destination_postal_code,
        Number(request.parcel.weight) || 1
      );

      log.error(`🚚 Usando servicio de envío: ${service}`);

      if (service === 'envioclick') {
        // Adaptar el formato para EnvíoClick
        const envioClickPayload = {
          origin_zip_code: request.origin_postal_code,
          destination_zip_code: request.destination_postal_code,
          package: {
            weight: request.parcel.weight,
            length: request.parcel.depth,
            width: request.parcel.width,
            height: request.parcel.height
          }
        };

        const result = await this.envioClickClient.getIndividualQuotation(envioClickPayload);

        if (result.success && result.data) {
          // Transformar respuesta al formato común
          const quotes = Array.isArray(result.data) ? result.data : [result.data];
          return {
            success: true,
            quotes: quotes.map((quote: any) => ({
              carrier: quote.carrier || quote.company || 'Desconocido',
              service: quote.service || 'Estándar',
              price: quote.price || quote.amount || 0,
              currency: 'MXN',
              estimated_delivery: quote.estimated_delivery || 'No disponible',
              available: true
            })),
            provider: 'envioclick'
          };
        } else {
          return {
            success: false,
            error: result.error || 'Error al obtener cotización con EnvíoClick',
            provider: 'envioclick'
          };
        }
      } else {
        // Adaptar el formato para EnvíosPerros
        const enviosPerrosPayload = {
          depth: request.parcel.depth || 0,
          width: request.parcel.width || 0,
          height: request.parcel.height || 0,
          weight: request.parcel.weight || 0,
          origin: {
            codePostal: request.origin_postal_code
          },
          destination: {
            codePostal: request.destination_postal_code
          }
        };

        const result = await this.enviosPerrosClient.getShippingRates(enviosPerrosPayload);

        if (result.success && result.data) {
          // Transformar respuesta al formato común
          const quotes = Array.isArray(result.data) ? result.data : [result.data];
          return {
            success: true,
            quotes: quotes.map((quote: any) => ({
              carrier: quote.carrier || quote.company || 'Desconocido',
              service: quote.service || 'Estándar',
              price: quote.price || quote.amount || 0,
              currency: 'MXN',
              estimated_delivery: quote.estimated_delivery || 'No disponible',
              available: quote.available !== undefined ? quote.available : true
            })),
            provider: 'enviosperros'
          };
        } else {
          return {
            success: false,
            error: result.error || 'Error al obtener cotización con EnvíosPerros',
            provider: 'enviosperros'
          };
        }
      }
    } catch (error) {
      log.error('❌ Error al obtener cotizaciones de envío:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado al obtener cotizaciones'
      };
    }
  }

  /**
   * Crea una orden de envío con el proveedor más adecuado
   */
  async createShippingOrder(request: ShippingOrderRequest): Promise<ShippingOrderResult> {
    try {
      // Determinar qué servicio usar basado en la configuración
      const service = getShippingService(
        request.sender.postal_code || '',
        request.recipient.postal_code || '',
        Number(request.parcel.weight) || 1
      );

      log.error(`🚚 Usando servicio de envío para crear orden: ${service}`);

      if (service === 'envioclick') {
        // Adaptar el formato para EnvíoClick
        const envioClickPayload = {
          address_from: request.sender,
          address_to: request.recipient,
          parcel: request.parcel,
          service: {
            carrier: request.service_type || 'ESTANDAR'
          },
          metadata: request.metadata
        };

        const result = await this.envioClickClient.createOrder(envioClickPayload);

        if (result.success && result.data) {
          // Transformar respuesta al formato común
          const data = result.data as Record<string, unknown>;
          return {
            success: true,
            tracking_number: (data.tracking_number as string) || (data.reference as string) || '',
            label_url: (data.label_url as string) || (data.pdf as string) || '',
            carrier: (data.carrier as string) || 'Desconocido',
            service: (data.service as string) || 'Estándar',
            price: (data.price as number) || 0,
            estimated_delivery: (data.estimated_delivery as string) || 'No disponible',
            provider: 'envioclick'
          };
        } else {
          return {
            success: false,
            error: result.error || 'Error al crear orden con EnvíoClick',
            provider: 'envioclick'
          };
        }
      } else {
        // Adaptar el formato para EnvíosPerros
        const enviosPerrosPayload = {
          sender: request.sender,
          recipient: request.recipient,
          parcel: request.parcel,
          service: {
            service_type: request.service_type || ENVIOSPERROS_SERVICES.ESTAFETA.ECONOMICO
          },
          metadata: request.metadata
        };

        const result = await this.enviosPerrosClient.createOrder(enviosPerrosPayload);

        if (result.success && result.data) {
          // Transformar respuesta al formato común
          const data = result.data as Record<string, unknown>;
          return {
            success: true,
            tracking_number: (data.reference as string) || '',
            label_url: (data.label_url as string) || '',
            carrier: (data.carrier as string) || 'Desconocido',
            service: (data.service as string) || 'Estándar',
            price: (data.price as number) || 0,
            estimated_delivery: (data.estimated_delivery as string) || 'No disponible',
            provider: 'enviosperros'
          };
        } else {
          return {
            success: false,
            error: result.error || 'Error al crear orden con EnvíosPerros',
            provider: 'enviosperros'
          };
        }
      }
    } catch (error) {
      log.error('❌ Error al crear orden de envío:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado al crear orden de envío'
      };
    }
  }

  /**
   * Genera la etiqueta de envío para una orden existente
   */
  async generateShippingLabel(trackingNumber: string, provider?: 'envioclick' | 'enviosperros'): Promise<{ success: boolean; label_url?: string; error?: string }> {
    try {
      // Si no se especifica el proveedor, intentar con ambos
      if (!provider) {
        // Primero intentar con EnvíosPerros
        const enviosPerrosResult = await this.enviosPerrosClient.generateLabel(trackingNumber, true);
        if (enviosPerrosResult.success) {
          const data = enviosPerrosResult.data as Record<string, unknown>;
          return {
            success: true,
            label_url: (data.pdf as string) || ''
          };
        }

        // Si falla, intentar con EnvíoClick
        const envioClickResult = await this.envioClickClient.trackShipment(trackingNumber);
        if (envioClickResult.success) {
          const data = envioClickResult.data as Record<string, unknown>;
          return {
            success: true,
            label_url: (data.label_url as string) || (data.pdf as string) || ''
          };
        }

        // Si ambos fallan, devolver error
        return {
          success: false,
          error: 'No se pudo generar la etiqueta con ningún proveedor'
        };
      } else if (provider === 'enviosperros') {
        const result = await this.enviosPerrosClient.generateLabel(trackingNumber, true);
        const data = result.data as Record<string, unknown>;
        return {
          success: result.success,
          label_url: (data.pdf as string) || '',
          error: result.error
        };
      } else {
        const result = await this.envioClickClient.trackShipment(trackingNumber);
        const data = result.data as Record<string, unknown>;
        return {
          success: result.success,
          label_url: (data.label_url as string) || (data.pdf as string) || '',
          error: result.error
        };
      }
    } catch (error) {
      log.error('❌ Error al generar etiqueta:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado al generar etiqueta'
      };
    }
  }

  /**
   * Cancela un envío existente
   */
  async cancelShipment(trackingNumber: string, provider?: 'envioclick' | 'enviosperros'): Promise<{ success: boolean; error?: string }> {
    try {
      // Si no se especifica el proveedor, intentar con ambos
      if (!provider) {
        // Primero intentar con EnvíosPerros
        const enviosPerrosResult = await this.enviosPerrosClient.cancelShipment(trackingNumber);
        if (enviosPerrosResult.success) {
          return { success: true };
        }

        // Si falla, intentar con EnvíoClick
        // Nota: EnvioClickClient no tiene método cancelOrder
        // const envioClickResult = await this.envioClickClient.cancelOrder(trackingNumber);
        // if (envioClickResult.success) {
        //   return { success: true };
        // }

        // Si ambos fallan, devolver error
        return {
          success: false,
          error: 'No se pudo cancelar el envío con ningún proveedor'
        };
      } else if (provider === 'enviosperros') {
        const result = await this.enviosPerrosClient.cancelShipment(trackingNumber);
        return {
          success: result.success,
          error: result.error
        };
      } else {
        // Nota: EnvioClickClient no tiene método cancelOrder
        // const result = await this.envioClickClient.cancelOrder(trackingNumber);
        // return {
        //   success: result.success,
        //   error: result.error
        // };
        return {
          success: false,
          error: 'Cancelación no disponible con EnvíoClick'
        };
      }
    } catch (error) {
      log.error('❌ Error al cancelar envío:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error inesperado al cancelar envío'
      };
    }
  }

  /**
   * Obtiene la URL de seguimiento para un envío
   */
  getTrackingUrl(trackingNumber: string, carrier: string, provider?: 'envioclick' | 'enviosperros'): string {
    // Si se especifica el proveedor, usar ese
    if (provider === 'enviosperros') {
      return this.enviosPerrosClient.getTrackingUrl(trackingNumber, carrier);
    } else if (provider === 'envioclick') {
      // Implementar método equivalente en EnvíoClick si existe
      return '';
    }

    // Si no se especifica, intentar con EnvíosPerros primero
    const enviosPerrosUrl = this.enviosPerrosClient.getTrackingUrl(trackingNumber, carrier);
    if (enviosPerrosUrl) {
      return enviosPerrosUrl;
    }

    // Si no hay URL con EnvíosPerros, devolver cadena vacía
    return '';
  }
}

// Exportar una instancia del servicio para uso global
export const shippingService = new ShippingService();