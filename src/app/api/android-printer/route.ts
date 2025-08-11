import { NextRequest, NextResponse } from 'next/server';

const ANDROID_PLUGIN_URL = 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'impresoras';

  try {
    const response = await fetch(`${ANDROID_PLUGIN_URL}/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error conectando al plugin Android:', error);
    return NextResponse.json(
      { error: 'No se puede conectar al plugin Android' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${ANDROID_PLUGIN_URL}/imprimir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();
    return NextResponse.json({ success: result === 'true', message: result });
  } catch (error) {
    console.error('Error enviando datos al plugin Android:', error);
    return NextResponse.json(
      { error: 'Error al enviar datos al plugin Android' },
      { status: 500 }
    );
  }
}
