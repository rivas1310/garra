import { NextResponse } from 'next/server';

const ENVIOSPERROS_API_KEY = '4ExUSFztbANYkmlOkAFNH3JbUSHSYo5VS8Mcg6r1';
const ENVIOSPERROS_API_URL = 'https://staging-app.enviosperros.com/api/v2';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await fetch(`${ENVIOSPERROS_API_URL}/shipping/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENVIOSPERROS_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json({ status: response.status, data });
  } catch (error) {
    return NextResponse.json({ status: 500, error: error instanceof Error ? error.message : String(error) });
  }
}

// GET opcional: solo para mostrar que el endpoint está activo
export async function GET() {
  return NextResponse.json({ message: 'Endpoint de cotización de Envíos Perros activo. Usa POST para cotizar.' });
} 