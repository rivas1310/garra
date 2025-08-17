import { NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    log.error('API /categorias: Starting to fetch categories...');
    const categorias = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    log.error('API /categorias: Found', { count: categorias.length, type: 'categories' });
    log.error('API /categorias: Categories data', { data: categorias });
    return NextResponse.json(categorias);
  } catch (error) {
    log.error('API /categorias: Error fetching categories:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}