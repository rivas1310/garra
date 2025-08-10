import { NextRequest, NextResponse } from 'next/server';
import { createEnviosPerrosClient } from '@/lib/create-envios-perros-client';

// Función helper para limitar la longitud de campos de texto
function limitText(text: string, maxLength: number): string {
  return (text || "").substring(0, maxLength);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📋 Generando guía con EnviosPerros. Payload:", body);

    const {
      selectedRate,
      orderData,
      originAddress,
      destinationAddress,
      packageDetails
    } = body;

    console.log("📋 Peso recibido del frontend:", packageDetails?.weight);
    console.log("📋 Detalles del paquete:", packageDetails);

    // Validar datos requeridos
    if (!selectedRate || !orderData || !originAddress || !destinationAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos incompletos para generar la guía',
          required: ['selectedRate', 'orderData', 'originAddress', 'destinationAddress']
        },
        { status: 400 }
      );
    }

    // Crear cliente de EnviosPerros
    const client = createEnviosPerrosClient();

    // Primero hacer una cotización para obtener las tarifas disponibles
    const quotationPayload = {
      "origin-codePostal": originAddress.postalCode || "44100",
      "destination-codePostal": destinationAddress.postalCode || "44200",
      depth: String(packageDetails.depth || 30.01),
      width: String(packageDetails.width || 20.01),
      height: String(packageDetails.height || 15.01),
      weight: String(packageDetails.weight || 1)
    };

    console.log("📋 Haciendo cotización primero...");
    const quotationResult = await client.getShippingRates(quotationPayload);
    console.log("📋 Resultado de cotización:", quotationResult);

    if (!quotationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al obtener cotización',
          details: quotationResult.error || quotationResult.details
        },
        { status: 500 }
      );
    }

    // Buscar la tarifa seleccionada en los resultados de la cotización
    const availableRates = (quotationResult.data as Record<string, unknown>)?.message as any[] || quotationResult.data as any[] || [];
    console.log("📋 Tarifas disponibles:", JSON.stringify(availableRates, null, 2));
    
    // Buscar una tarifa disponible (available: true) o usar la primera de 99Minutos
    let selectedRateFromQuotation = availableRates.find(rate => 
      rate.available === true && (
        rate.deliveryType?.company === "99Minutos" ||
        rate.title?.includes("99Minutos") ||
        rate.deliveryType?.name === "99MINUTOS_ECONOMICO"
      )
    );
    
    // Si no hay tarifa disponible de 99Minutos, buscar cualquier tarifa disponible
    if (!selectedRateFromQuotation) {
      selectedRateFromQuotation = availableRates.find(rate => rate.available === true);
    }
    
    // Si no hay ninguna tarifa disponible, usar la primera de 99Minutos aunque no esté disponible
    if (!selectedRateFromQuotation) {
      selectedRateFromQuotation = availableRates.find(rate => 
        rate.deliveryType?.company === "99Minutos" ||
        rate.title?.includes("99Minutos")
      );
    }
    
    // Si aún no hay nada, usar la primera tarifa disponible
    if (!selectedRateFromQuotation && availableRates.length > 0) {
      selectedRateFromQuotation = availableRates[0];
      console.log("⚠️ Usando la primera tarifa disponible:", selectedRateFromQuotation.title);
    }

    if (!selectedRateFromQuotation) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se encontraron tarifas disponibles para esta ruta',
          availableRates: availableRates
        },
        { status: 400 }
      );
    }
    
    console.log("✅ Tarifa seleccionada:", selectedRateFromQuotation.title);
    console.log("✅ Disponible:", selectedRateFromQuotation.available);
    console.log("✅ Servicio:", selectedRateFromQuotation.deliveryType?.name);

    // Preparar payload para crear orden usando la información de la cotización
    const orderPayload = {
      deliveryType: selectedRateFromQuotation.deliveryType?.name || selectedRateFromQuotation.service || selectedRate.service || "99MINUTOS_ECONOMICO",
      packageSize: {
        type: "Caja",
        depth: String(packageDetails.depth || 30.01),
        width: String(packageDetails.width || 20.01),
        height: String(packageDetails.height || 15.01),
        weight: String(packageDetails.weight || 1),
        description: "papeles"
      },
      origin: {
        company_origin: limitText(originAddress.company || "Garras Felinas", 50),
        street_origin: limitText(originAddress.street || "Prolongación 20 de Noviembre", 100),
        interior_number_origin: limitText(originAddress.interiorNumber || "", 20),
        outdoor_number_origin: limitText(originAddress.exteriorNumber || "224", 20),
        zip_code_origin: limitText(originAddress.postalCode || "45100", 10),
        neighborhood_origin: limitText(originAddress.neighborhood || "Zapopan Centro", 50),
        city_origin: limitText(originAddress.city || "Zapopan", 50),
        state_origin: limitText(originAddress.state || "Jalisco", 50),
        references_origin: "Tienda Garras Felinas",
        name_origin: limitText(originAddress.name || "Garras Felinas", 50),
        email_origin: limitText(originAddress.email || "envios@garrasfelinas.com", 100),
        phone_origin: limitText(originAddress.phone || "3327432497", 20),
        save_origin: "false"
      },
      destination: {
        company_dest: limitText(destinationAddress.company || "Cliente", 50),
        street_dest: limitText(destinationAddress.street || "euforia", 100),
        interior_number_dest: limitText(destinationAddress.interiorNumber || "", 20),
        outdoor_number_dest: limitText(destinationAddress.exteriorNumber || "1588", 20),
        zip_code_dest: limitText(destinationAddress.postalCode || "45200", 10),
        neighborhood_dest: limitText(destinationAddress.neighborhood || "Centro", 50),
        city_dest: limitText(destinationAddress.city || "zapopa", 50),
        state_dest: limitText(destinationAddress.state || "Jalisco", 50),
        references_dest: limitText(destinationAddress.references || "Sin referencias", 25),
        name_dest: limitText(destinationAddress.name || orderData.customer?.name || "Cliente", 50),
        email_dest: limitText(destinationAddress.email || orderData.customer?.email || "cliente@email.com", 100),
        phone_dest: limitText(destinationAddress.phone || orderData.customer?.phone || "3331234567", 20),
        save_dest: "false",
        ocurre: "false"
      }
    };

    console.log("📋 Payload para crear orden:", JSON.stringify(orderPayload, null, 2));
    console.log("📋 URL del cliente:", "Configurado");
    console.log("📋 API Key del cliente:", "Presente");

    // Crear la orden
    console.log("📋 Intentando crear orden con payload:", JSON.stringify(orderPayload, null, 2));
    const orderResult = await client.createOrder(orderPayload);
    console.log("📋 Resultado de crear orden:", JSON.stringify(orderResult, null, 2));

    if (!orderResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al crear la orden',
          details: orderResult.error || orderResult.details
        },
        { status: 500 }
      );
    }

    // Obtener el número de guía de la respuesta
    const data = orderResult.data as Record<string, unknown>;
    const message = data?.message as Record<string, unknown>;
    const reason = message?.reason as Record<string, unknown>;
    const reference = reason?.reference as string || data?.reference as string || data?.guide_number as string;
    
    if (!reference) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo obtener el número de guía',
          orderResult
        },
        { status: 500 }
      );
    }

    console.log("📋 Guía creada exitosamente. Referencia:", reference);

    // Generar el PDF de la etiqueta
    console.log("📋 Intentando generar PDF para referencia:", reference);
    const pdfResult = await client.generateLabel(reference, true); // Usar base64
    console.log("📋 Resultado de generar PDF:", JSON.stringify(pdfResult, null, 2));

    if (!pdfResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al generar el PDF de la etiqueta',
          details: pdfResult.error || pdfResult.details,
          reference: reference
        },
        { status: 500 }
      );
    }

    // Retornar la respuesta exitosa
    const pdfData = pdfResult.data as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      reference: reference,
      pdfUrl: pdfData?.url as string,
      pdfBase64: pdfData?.base64 as string,
      pdfContentType: pdfData?.contentType as string,
      pdfSize: pdfData?.size as number,
      orderData: orderResult.data,
      message: "Guía generada exitosamente"
    });

  } catch (error) {
    console.error("❌ Error al generar guía:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 