import { NextRequest, NextResponse } from "next/server";
import { createEnvioClickClient } from "@/lib/envio-click-client";

// Cliente robusto con sistema de fallback automático
const envioClickClient = createEnvioClickClient();

// Función para obtener cotización individual
export async function POST(req: Request) {
  try {
    console.log("💰 Obteniendo cotización individual...");
    
    const body = await req.json();
    
    // Validar campos requeridos según la documentación
    const requiredFields = ['origin_zip_code', 'destination_zip_code', 'package'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos requeridos faltantes',
          missingFields
        },
        { status: 400 }
      );
    }
    
    // Validar campos del paquete
    const packageRequiredFields = ['description', 'contentValue', 'weight', 'length', 'height', 'width'];
    const missingPackageFields = packageRequiredFields.filter(field => !body.package[field]);
    
    if (missingPackageFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos requeridos del paquete faltantes',
          missingPackageFields
        },
        { status: 400 }
      );
    }
    
    // Validar rangos según la documentación
    const validationErrors = [];
    
    // Validar códigos postales (deben ser de 5 caracteres)
    if (body.origin_zip_code.length !== 5) {
      validationErrors.push('origin_zip_code debe tener exactamente 5 caracteres');
    }
    
    if (body.destination_zip_code.length !== 5) {
      validationErrors.push('destination_zip_code debe tener exactamente 5 caracteres');
    }
    
    // Validar campos opcionales si están presentes
    if (body.origin_address && (body.origin_address.length < 2 || body.origin_address.length > 29)) {
      validationErrors.push('origin_address debe tener entre 2 y 29 caracteres');
    }
    
    if (body.origin_number && (body.origin_number.length < 1 || body.origin_number.length > 5)) {
      validationErrors.push('origin_number debe tener entre 1 y 5 caracteres');
    }
    
    if (body.origin_suburb && body.origin_suburb.length < 2) {
      validationErrors.push('origin_suburb debe tener al menos 2 caracteres');
    }
    
    if (body.destination_address && (body.destination_address.length < 2 || body.destination_address.length > 29)) {
      validationErrors.push('destination_address debe tener entre 2 y 29 caracteres');
    }
    
    if (body.destination_number && (body.destination_number.length < 1 || body.destination_number.length > 5)) {
      validationErrors.push('destination_number debe tener entre 1 y 5 caracteres');
    }
    
    if (body.destination_suburb && body.destination_suburb.length < 2) {
      validationErrors.push('destination_suburb debe tener al menos 2 caracteres');
    }
    
    // Validar campos del paquete
    if (body.package.description.length < 3 || body.package.description.length > 28) {
      validationErrors.push('package.description debe tener entre 3 y 28 caracteres');
    }
    
    if (body.package.contentValue > 100000) {
      validationErrors.push('package.contentValue no debe ser mayor a 100000');
    }
    
    if (body.package.weight < 1.0 || body.package.weight > 1000) {
      validationErrors.push('package.weight debe estar entre 1.0 y 1000 kg');
    }
    
    if (body.package.length < 1.0 || body.package.length > 300) {
      validationErrors.push('package.length debe estar entre 1.0 y 300 cm');
    }
    
    if (body.package.height < 1.0 || body.package.height > 300) {
      validationErrors.push('package.height debe estar entre 1.0 y 300 cm');
    }
    
    if (body.package.width < 1.0 || body.package.width > 300) {
      validationErrors.push('package.width debe estar entre 1.0 y 300 cm');
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Errores de validación',
          validationErrors
        },
        { status: 400 }
      );
    }
    
    // Usar el cliente robusto para obtener cotización individual
    const result = await envioClickClient.getIndividualQuotation(body);
    
    console.log("📋 Resultado de cotización individual:", {
      success: result.success,
      endpoint: result.endpoint,
      statusCode: result.statusCode
    });

    if (!result.success) {
      console.error("❌ Error al obtener cotización individual:", {
        error: result.error,
        endpoint: result.endpoint,
        statusCode: result.statusCode,
      });
      
      // Determinar si el error está relacionado con autenticación o HTML
      const isAuthError = result.statusCode === 401 || result.error?.includes('autenticación');
      const isHtmlError = result.error?.includes('HTML');
      
      let suggestion = "Contactar soporte técnico de Envío Click para confirmar endpoints correctos";
      
      if (isAuthError) {
        suggestion = "Verificar las credenciales de API y confirmar con Envío Click que las URLs son correctas";
      } else if (isHtmlError) {
        suggestion = "La API está devolviendo HTML en lugar de JSON. Es posible que las URLs no sean correctas o que se requiera autenticación";
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al obtener cotización individual',
          details: result.error,
          endpoint: result.endpoint,
          suggestion,
          isHtmlResponse: isHtmlError,
          isAuthError
        },
        { status: result.statusCode || 500 }
      );
    }
    
    // Verificar si la respuesta contiene datos HTML
    if (result.data && typeof result.data === 'object' && 'isHtml' in result.data && result.data.isHtml) {
      console.warn("⚠️ Se recibió HTML en lugar de JSON en la respuesta exitosa");
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Respuesta HTML recibida en lugar de JSON',
          details: 'La API de Envío Click devolvió una página HTML en lugar de datos JSON. Es posible que se requiera autenticación o que la URL no sea correcta.',
          endpoint: result.endpoint,
          suggestion: "Verificar las credenciales de API y confirmar con Envío Click que las URLs son correctas",
          htmlSnippet: result.data.snippet,
          isHtmlResponse: true
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      endpoint: result.endpoint
    });
  } catch (error) {
    console.error('❌ Error inesperado al obtener cotización individual:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error inesperado al obtener cotización individual',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}