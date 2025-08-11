import { NextRequest, NextResponse } from 'next/server';

// Por defecto localhost, pero puede ser sobrescrito con la IP del teléfono
const DEFAULT_ANDROID_PLUGIN_URL = 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'impresoras';
  const phoneIp = searchParams.get('phoneIp');
  
  // Usar la IP del teléfono si se proporciona, sino localhost
  const androidPluginUrl = phoneIp ? `http://${phoneIp}:8000` : DEFAULT_ANDROID_PLUGIN_URL;

  try {
    console.log(`Intentando conectar a: ${androidPluginUrl}/${endpoint}`);
    
    const response = await fetch(`${androidPluginUrl}/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Agregar timeout para evitar esperas largas
      signal: AbortSignal.timeout(10000), // 10 segundos
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Respuesta exitosa del plugin Android:', data);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorObj = error as Error;
    console.error('Error conectando al plugin Android:', {
      message: errorObj.message,
      url: `${androidPluginUrl}/${endpoint}`,
      phoneIp,
      error: errorObj
    });
    
    // Proporcionar más detalles del error
    const errorMessage = errorObj.name === 'TimeoutError' 
      ? 'Timeout: El plugin no responde en 10 segundos'
      : errorObj.message?.includes('fetch')
      ? 'Error de red: No se puede conectar al plugin'
      : `Error: ${errorObj.message || 'Error desconocido'}`;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: {
          url: `${androidPluginUrl}/${endpoint}`,
          phoneIp: phoneIp || 'localhost',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phoneIp = searchParams.get('phoneIp');
  
  // Usar la IP del teléfono si se proporciona, sino localhost
  const androidPluginUrl = phoneIp ? `http://${phoneIp}:8000` : DEFAULT_ANDROID_PLUGIN_URL;
  
  try {
    const body = await request.json();
    
    console.log(`Enviando datos de impresión a: ${androidPluginUrl}/imprimir`);
    console.log('Datos a enviar:', body);
    
    const response = await fetch(`${androidPluginUrl}/imprimir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Agregar timeout
      signal: AbortSignal.timeout(15000), // 15 segundos para impresión
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();
    console.log('Resultado de impresión:', result);
    return NextResponse.json({ success: result === 'true', message: result });
  } catch (error: unknown) {
    const errorObj = error as Error;
    console.error('Error enviando datos al plugin Android:', {
      message: errorObj.message,
      url: `${androidPluginUrl}/imprimir`,
      phoneIp,
      error: errorObj
    });
    
    const errorMessage = errorObj.name === 'TimeoutError' 
      ? 'Timeout: La impresión no responde en 15 segundos'
      : errorObj.message?.includes('fetch')
      ? 'Error de red: No se puede conectar al plugin para imprimir'
      : `Error: ${errorObj.message || 'Error desconocido'}`;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: {
          url: `${androidPluginUrl}/imprimir`,
          phoneIp: phoneIp || 'localhost',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
