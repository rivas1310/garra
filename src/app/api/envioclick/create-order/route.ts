import { NextRequest, NextResponse } from "next/server";
import { log } from '@/lib/secureLogger'
import { createEnvioClickClient } from "@/lib/envio-click-client";

// Cliente robusto con sistema de fallback automático
const envioClickClient = createEnvioClickClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, selectedRate, addressFrom, addressTo, parcel, orderData } = body;

    // Validar que los campos requeridos estén presentes
    if (!orderId || !selectedRate || !addressFrom || !addressTo || !parcel) {
      return NextResponse.json(
        { 
          error: "Faltan campos requeridos",
          required: ["orderId", "selectedRate", "addressFrom", "addressTo", "parcel"],
          received: Object.keys(body)
        },
        { status: 400 }
      );
    }

    log.error("Creando orden de envío con datos:", {
      orderId,
      selectedRate: selectedRate?.deliveryType?.company,
      addressFrom: addressFrom?.city,
      addressTo: addressTo?.city,
      parcel: parcel?.weight
    });

    // Preparar el payload para Envío Click
    const envioClickPayload = {
      // Información del remitente (dirección real de la tienda)
      address_from: {
        name: addressFrom.name || "Bazar Fashion",
        company: addressFrom.company || "Bazar Fashion",
        street: addressFrom.street || "Av. Revolución",
        number: addressFrom.number || "381",
        district: addressFrom.district || "Guadalajara Centro",
        city: addressFrom.city || "Guadalajara",
        state: addressFrom.state || "Jalisco",
        country: addressFrom.country || "México",
        postal_code: addressFrom.postalCode || "44100",
        phone: addressFrom.phone || "3336125478",
        email: addressFrom.email || "envios@bazarfashion.com"
      },
      // Información del destinatario
      address_to: {
        name: addressTo.name,
        company: addressTo.company,
        street: addressTo.street,
        number: addressTo.number,
        district: addressTo.district,
        city: addressTo.city,
        state: addressTo.state,
        country: addressTo.country,
        postal_code: addressTo.postalCode,
        phone: addressTo.phone,
        email: addressTo.email
      },
      // Información del paquete
      parcel: {
        weight: parcel.weight,
        depth: parcel.depth,
        width: parcel.width,
        height: parcel.height,
        content: parcel.content
      },
      // Información del servicio seleccionado
      service: {
        carrier: selectedRate.deliveryType?.company || selectedRate.paqueteria,
        service_type: selectedRate.deliveryType?.name || selectedRate.title,
        delivery_type: selectedRate.deliveryType?.description || selectedRate.servicio
      },
      // Metadatos adicionales
      metadata: {
        order_id: orderId,
        platform: "garra-felina",
        total_amount: orderData?.total,
        items_count: orderData?.items?.length || 0
      }
    };

    log.error("Payload para Envío Click:", JSON.stringify(envioClickPayload, null, 2));

    // Usar el cliente robusto con sistema de fallback automático
    log.error("🚀 Iniciando creación de orden con sistema de fallback...");
    
    const result = await envioClickClient.createOrder(envioClickPayload);
    
    log.error("📋 Resultado de Envío Click:", {
      success: result.success,
      endpoint: result.endpoint,
      statusCode: result.statusCode
    });

    if (!result.success) {
      log.error("❌ Error de Envío Click:", {
        error: result.error,
        endpoint: result.endpoint,
        statusCode: result.statusCode,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al crear orden de envío',
          details: result.error,
          endpoint: result.endpoint,
          suggestion: "Verificar los datos proporcionados y contactar soporte técnico si el problema persiste"
        },
        { status: result.statusCode || 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      endpoint: result.endpoint,
      message: "Orden de envío creada exitosamente"
    });
  } catch (error) {
    log.error('❌ Error inesperado al crear orden:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error inesperado al crear orden de envío',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}