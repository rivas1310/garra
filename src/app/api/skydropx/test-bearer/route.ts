import { NextResponse } from 'next/server';
import { testBearerConnection } from '../route';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Falta el parámetro token en la URL.' }, { status: 400 });
  }
  const result = await testBearerConnection(token);
  return NextResponse.json(result, { status: result.status });
}

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: 'Falta el campo token en el body.' }, { status: 400 });
  }
  const result = await testBearerConnection(token);
  return NextResponse.json(result, { status: result.status });
} 