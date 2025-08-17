import { NextResponse } from 'next/server'

export async function GET() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY
  
  if (!publishableKey) {
    return NextResponse.json({ error: 'STRIPE_PUBLISHABLE_KEY no está configurada' }, { status: 500 })
  }
  
  return NextResponse.json({ publishableKey })
} 