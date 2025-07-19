import { NextResponse } from 'next/server';

const ENVIOSPERROS_API_KEY = '4ExUSFztbANYkmlOkAFNH3JbUSHSYo5VS8Mcg6r1';
const ENVIOSPERROS_API_URL = 'https://staging-app.enviosperros.com/api/v2';

export async function GET() {
  try {
    // Hacer una petición de prueba para verificar el estado de la cuenta
    const testBody = {
      depth: 20,
      width: 30,
      height: 10,
      weight: 1,
      origin: { codePostal: "03100" },
      destination: { codePostal: "64000" }
    };

    const response = await fetch(`${ENVIOSPERROS_API_URL}/shipping/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENVIOSPERROS_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testBody),
    });

    const data = await response.json();
    
    // Analizar la respuesta para determinar el estado
    let status = 'unknown';
    let message = '';
    let recommendations: any[] = [];

    if (data.data && data.data.message) {
      const rates = data.data.message;
      const hasAccountIssues = rates.some((rate: any) => 
        rate.status_description && rate.status_description.includes("limite de envíos")
      );

      if (hasAccountIssues) {
        status = 'account_issue';
        message = 'La cuenta de Envíos Perros tiene problemas de verificación o límites alcanzados.';
        recommendations = [
          'Verificar la identidad de la cuenta en el panel de Envíos Perros',
          'Contactar al soporte de Envíos Perros para resolver el problema',
          'Verificar que la cuenta esté activa y tenga saldo disponible',
          'Revisar si hay documentos pendientes de verificación',
          'Acceder a: https://staging-app.enviosperros.com/integrations para verificar el estado'
        ];
      } else if (rates.some((rate: any) => rate.available)) {
        status = 'working';
        message = 'La cuenta de Envíos Perros está funcionando correctamente.';
      } else {
        status = 'no_rates';
        message = 'No se encontraron tarifas disponibles para la ruta especificada.';
        recommendations = [
          'Verificar que los códigos postales sean válidos',
          'Intentar con diferentes dimensiones o peso del paquete',
          'Contactar al soporte si el problema persiste'
        ];
      }
    } else if (data.message && Array.isArray(data.message)) {
      // Si la respuesta viene directamente en data.message
      const rates = data.message;
      const hasAccountIssues = rates.some((rate: any) => 
        rate.status_description && rate.status_description.includes("limite de envíos")
      );

      if (hasAccountIssues) {
        status = 'account_issue';
        message = 'La cuenta de Envíos Perros tiene problemas de verificación o límites alcanzados.';
        recommendations = [
          'Verificar la identidad de la cuenta en el panel de Envíos Perros',
          'Contactar al soporte de Envíos Perros para resolver el problema',
          'Verificar que la cuenta esté activa y tenga saldo disponible',
          'Revisar si hay documentos pendientes de verificación',
          'Acceder a: https://staging-app.enviosperros.com/integrations para verificar el estado'
        ];
      } else if (rates.some((rate: any) => rate.available)) {
        status = 'working';
        message = 'La cuenta de Envíos Perros está funcionando correctamente.';
      } else {
        status = 'no_rates';
        message = 'No se encontraron tarifas disponibles para la ruta especificada.';
        recommendations = [
          'Verificar que los códigos postales sean válidos',
          'Intentar con diferentes dimensiones o peso del paquete',
          'Contactar al soporte si el problema persiste'
        ];
      }
    } else {
      status = 'unknown';
      message = 'No se pudo determinar el estado de la cuenta.';
      recommendations = [
        'Verificar la respuesta de la API',
        'Contactar al soporte técnico'
      ];
    }

    return NextResponse.json({
      status,
      message,
      recommendations,
      timestamp: new Date().toISOString(),
      apiResponse: data
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 