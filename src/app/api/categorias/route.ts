import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('API /categorias: Starting to fetch categories...');
    const categorias = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    console.log('API /categorias: Found', categorias.length, 'categories');
    console.log('API /categorias: Categories data:', categorias);
    return NextResponse.json(categorias);
  } catch (error) {
    console.error('API /categorias: Error fetching categories:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}