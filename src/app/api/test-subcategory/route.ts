import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'

export async function GET(request: NextRequest) {
  try {
    log.error('🧪 Endpoint de prueba llamado')
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    log.error('📊 Categoría de prueba:', category)

    // Simular conteos para pruebas
    const mockCounts = {
      'Vestidos': 5,
      'Blusas': 3,
      'Pantalones': 8
    }

    return NextResponse.json({
      success: true,
      category: category || 'test',
      counts: mockCounts,
      total: 16,
      message: 'Endpoint de prueba funcionando correctamente'
    })

  } catch (error) {
    log.error('💥 Error en endpoint de prueba:', error)
    return NextResponse.json(
      { error: 'Error en endpoint de prueba' },
      { status: 500 }
    )
  }
}
