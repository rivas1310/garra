import { NextRequest, NextResponse } from 'next/server'
import { 
  generateTestLabelTSPL, 
  generateProductLabelTSPL, 
  generateMultipleProductLabelsTSPL,
  type TSPLLabelData 
} from '@/lib/tsplGenerator'

/**
 * API para generar comandos TSPL para impresoras de etiquetas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, labelSize = '51x25', copies = 1, ...data } = body

    let tsplCommands: string

    switch (type) {
      case 'test':
        tsplCommands = generateTestLabelTSPL(labelSize, copies)
        break



      case 'product':
        if (!data.labelData) {
          return NextResponse.json(
            { error: 'labelData es requerido para etiquetas de producto' },
            { status: 400 }
          )
        }
        tsplCommands = generateProductLabelTSPL(data.labelData as TSPLLabelData, labelSize, copies)
        break

      case 'multiple':
        if (!data.labels || !Array.isArray(data.labels)) {
          return NextResponse.json(
            { error: 'labels array es requerido para múltiples etiquetas' },
            { status: 400 }
          )
        }
        tsplCommands = generateMultipleProductLabelsTSPL(data.labels as TSPLLabelData[], labelSize)
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de etiqueta no válido. Usar: test, product, multiple' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      commands: tsplCommands,
      type,
      labelSize,
      copies
    })

  } catch (error) {
    console.error('Error generando comandos TSPL:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET para obtener información sobre los tipos de etiquetas disponibles
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    availableTypes: [
      {
        type: 'test',
        description: 'Etiqueta de prueba con texto y código de barras de ejemplo',
        parameters: ['labelSize', 'copies']
      },

      {
        type: 'product',
        description: 'Etiqueta de producto individual',
        parameters: ['labelSize', 'copies', 'labelData']
      },
      {
        type: 'multiple',
        description: 'Múltiples etiquetas de productos',
        parameters: ['labelSize', 'labels']
      }
    ],
    availableLabelSizes: ['50x20', '51x25', '30x21', '10x21'],
    defaultLabelSize: '51x25'
  })
}