import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('=== PRUEBA DE PRISMA ===');
    console.log('Prisma client:', typeof prisma);
    console.log('Prisma client disponible:', !!prisma);
    
    if (!prisma) {
      return NextResponse.json({ error: 'Prisma no está disponible' }, { status: 500 });
    }

    // Intentar una consulta simple
    const categoryCount = await prisma.category.count();
    console.log('Número de categorías en BD:', categoryCount);

    return NextResponse.json({
      success: true,
      prismaAvailable: true,
      categoryCount,
      message: 'Prisma está funcionando correctamente'
    });

  } catch (error) {
    console.error('Error en prueba de Prisma:', error);
    return NextResponse.json({
      error: 'Error en prueba de Prisma',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
