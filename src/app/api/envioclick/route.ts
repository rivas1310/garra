import { NextRequest, NextResponse } from "next/server";
import { createEnvioClickClient } from "@/lib/envio-click-client";

// Cliente robusto con sistema de fallback automático
const envioClickClient = createEnvioClickClient();

// Función para obtener cotizaciones de envío
export async function POST(req: Request) {
  try {
    console.log("💰 Obteniendo cotizaciones de envío...");
    
    const body = await req.json();
    console.log('Payload recibido en /api/envioclick:', body);
    
    // Validar que el campo 'package' y sus subcampos existen
    if (!body.package || typeof body.package !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: "El campo 'package' es obligatorio y debe ser un objeto con los datos del paquete.",
          requiredFields: [
            'package.description',
            'package.contentValue',
            'package.weight',
            'package.length',
            'package.height',
            'package.width'
          ]
        },
        { status: 400 }
      );
    }
    const requiredPackageFields = ['description', 'contentValue', 'weight', 'length', 'height', 'width'];
    const missingPackageFields = requiredPackageFields.filter(f => body.package[f] === undefined);
    if (missingPackageFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios en 'package'",
          missingFields: missingPackageFields.map(f => `package.${f}`)
        },
        { status: 400 }
      );
    }
    
    // Usar el cliente robusto para obtener cotizaciones
    const result = await envioClickClient.getIndividualQuotation(body);
    
    console.log("📋 Resultado de cotizaciones:", {
      success: result.success,
      endpoint: result.endpoint,
      statusCode: result.statusCode
    });

    if (!result.success) {
      console.error("❌ Error al obtener cotizaciones:", {
        error: result.error,
        endpoint: result.endpoint,
        statusCode: result.statusCode,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al obtener cotizaciones de envío',
          details: result.error,
          endpoint: result.endpoint,
          suggestion: "Contactar soporte técnico de Envío Click para confirmar endpoints correctos"
        },
        { status: result.statusCode || 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      endpoint: result.endpoint
    });
  } catch (error) {
    console.error('❌ Error inesperado al obtener cotizaciones:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error inesperado al obtener cotizaciones de envío',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Función para tracking de envíos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Número de tracking requerido' },
        { status: 400 }
      );
    }

    console.log("🔍 Iniciando tracking con sistema de fallback...");
    
    const result = await envioClickClient.trackShipment(trackingNumber);
    
    console.log("📋 Resultado de tracking:", {
      success: result.success,
      endpoint: result.endpoint,
      statusCode: result.statusCode
    });

    if (!result.success) {
      console.error("❌ Error de tracking:", {
        error: result.error,
        endpoint: result.endpoint,
        statusCode: result.statusCode,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al obtener información de tracking',
          details: result.error,
          endpoint: result.endpoint,
          suggestion: "Contactar soporte técnico de Envío Click para confirmar endpoints correctos"
        },
        { status: result.statusCode || 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      endpoint: result.endpoint
    });
  } catch (error) {
    console.error('❌ Error inesperado al obtener tracking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error inesperado al obtener información de tracking',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}