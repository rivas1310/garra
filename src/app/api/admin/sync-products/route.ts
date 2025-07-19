import { NextResponse } from 'next/server';
import { syncProductActiveStatus } from '@/lib/productUtils';

export async function POST() {
  try {
    const updatedCount = await syncProductActiveStatus();
    
    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${updatedCount} productos actualizados`,
      updatedCount
    });
  } catch (error) {
    console.error('Error syncing products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al sincronizar productos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const updatedCount = await syncProductActiveStatus();
    
    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${updatedCount} productos actualizados`,
      updatedCount
    });
  } catch (error) {
    console.error('Error syncing products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al sincronizar productos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 