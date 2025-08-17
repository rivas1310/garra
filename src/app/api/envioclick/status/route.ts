import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'

const ENVIOCLICK_API_KEY = process.env.ENVIOCLICK_API_KEY;
const ENVIOCLICK_API_URL = process.env.ENVIOCLICK_API_URL;

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

    const response = await fetch(`${ENVIOCLICK_API_URL}/shipping/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENVIOCLICK_API_KEY}`,
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
        message = 'La cuenta de Envío Click tiene problemas de verificación o límites alcanzados.';
        recommendations = [
          'Verificar la identidad de la cuenta en el panel de Envío Click',
          'Contactar al soporte de Envío Click para resolver el problema',
          'Verificar que la cuenta esté activa y tenga saldo disponible',
          'Revisar si hay documentos pendientes de verificación',
          `Acceder a: ${ENVIOCLICK_API_URL?.replace('/api/v2', '')}/integrations para verificar el estado`
        ];
      } else if (rates.some((rate: any) => rate.available)) {
        status = 'working';
        message = 'La cuenta de Envío Click está funcionando correctamente.';
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
        message = 'La cuenta de Envío Click tiene problemas de verificación o límites alcanzados.';
        recommendations = [
          'Verificar la identidad de la cuenta en el panel de Envío Click',
          'Contactar al soporte de Envío Click para resolver el problema',
          'Verificar que la cuenta esté activa y tenga saldo disponible',
          'Revisar si hay documentos pendientes de verificación',
          `Acceder a: ${ENVIOCLICK_API_URL?.replace('/api/v2', '')}/integrations para verificar el estado`
        ];
      } else if (rates.some((rate: any) => rate.available)) {
        status = 'working';
        message = 'La cuenta de Envío Click está funcionando correctamente.';
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
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    log.error('Error al verificar estado de la cuenta:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error al verificar el estado de la cuenta',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      },
      { status: 500 }
    );
  }
}