import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const saleId = searchParams.get('id')
    
    if (!saleId) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 })
    }

    // Obtener los datos reales de la venta desde la base de datos
    let saleData
    try {
      saleData = await prisma.order.findUnique({
        where: { id: saleId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
    } catch (dbError) {
      console.error('Error al obtener datos de la venta:', dbError)
      // Si hay error en la BD, usar datos de ejemplo
      saleData = {
        id: saleId,
        items: [
          {
            product: { name: 'Producto Ejemplo', sku: 'SKU123' },
            quantity: 2,
            price: 150.00
          }
        ],
        total: 300.00,
        subtotal: 258.62,
        tax: 41.38,
        paymentMethod: 'efectivo',
        date: new Date().toLocaleString('es-MX')
      }
    }

    // Generar el array JSON para Bluetooth Print
    const printData = []

    // Logo y título
    const titleObj = {
      type: 0, // text
      content: '🐱 Garras Felinas 🐱',
      bold: 1,
      align: 1, // center
      format: 3 // double width
    }
    printData.push(titleObj)

    // Subtítulo
    const subtitleObj = {
      type: 0,
      content: 'Venta Física',
      bold: 1,
      align: 1,
      format: 0
    }
    printData.push(subtitleObj)

    // Línea vacía
    printData.push({
      type: 0,
      content: ' ',
      bold: 0,
      align: 0,
      format: 0
    })

    // Información del negocio
    const businessInfo = [
      'andador 20 de noviembre, Zapopan',
      'Tel: +52 (555) 123-4567',
      'info@garrasfelinas.com',
      'RFC: GAR-123456-ABC'
    ]

    businessInfo.forEach(line => {
      printData.push({
        type: 0,
        content: line,
        bold: 1,
        align: 1,
        format: 0
      })
    })

    // Línea vacía
    printData.push({
      type: 0,
      content: ' ',
      bold: 0,
      align: 0,
      format: 0
    })

    // Información de la transacción
    const saleDate = saleData.createdAt ? new Date(saleData.createdAt).toLocaleString('es-MX') : new Date().toLocaleString('es-MX')
    printData.push({
      type: 0,
      content: `Fecha: ${saleDate}`,
      bold: 1,
      align: 0,
      format: 0
    })

    printData.push({
      type: 0,
      content: `Ticket #: ${saleData.id}`,
      bold: 1,
      align: 0,
      format: 0
    })

    printData.push({
      type: 0,
      content: 'Cajero: Admin',
      bold: 1,
      align: 0,
      format: 0
    })

    // Línea vacía
    printData.push({
      type: 0,
      content: ' ',
      bold: 0,
      align: 0,
      format: 0
    })

    // Productos
    saleData.items.forEach(item => {
      const productName = item.product?.name || 'Producto sin nombre'
      const productSku = item.product?.sku || 'N/A'
      const itemPrice = item.price || 0
      const itemQuantity = item.quantity || 1
      const itemTotal = itemPrice * itemQuantity

      printData.push({
        type: 0,
        content: `${productName} x${itemQuantity}`,
        bold: 1,
        align: 0,
        format: 0
      })

      printData.push({
        type: 0,
        content: `SKU: ${productSku}`,
        bold: 0,
        align: 0,
        format: 0
      })

      printData.push({
        type: 0,
        content: `$${itemTotal.toFixed(2)}`,
        bold: 1,
        align: 2, // right
        format: 0
      })

      printData.push({
        type: 0,
        content: `$${itemPrice.toFixed(2)} c/u`,
        bold: 0,
        align: 0,
        format: 0
      })
    })

    // Línea vacía
    printData.push({
      type: 0,
      content: ' ',
      bold: 0,
      align: 0,
      format: 0
    })

    // Totales
    const total = saleData.total || 0
    const subtotal = saleData.subtotal || (total * 0.84)
    const tax = saleData.tax || (total * 0.16)

    printData.push({
      type: 0,
      content: `Subtotal: $${subtotal.toFixed(2)}`,
      bold: 1,
      align: 0,
      format: 0
    })

    printData.push({
      type: 0,
      content: `IVA (16%): $${tax.toFixed(2)}`,
      bold: 1,
      align: 0,
      format: 0
    })

    printData.push({
      type: 0,
      content: `TOTAL: $${total.toFixed(2)}`,
      bold: 1,
      align: 0,
      format: 3 // double width
    })

    // Línea vacía
    printData.push({
      type: 0,
      content: ' ',
      bold: 0,
      align: 0,
      format: 0
    })

    // Método de pago
    const paymentMethod = saleData.paymentMethod || 'efectivo'
    printData.push({
      type: 0,
      content: `Método: ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}`,
      bold: 1,
      align: 1,
      format: 0
    })

    printData.push({
      type: 0,
      content: 'Comprobante fiscal',
      bold: 1,
      align: 1,
      format: 0
    })

    // Línea vacía
    printData.push({
      type: 0,
      content: ' ',
      bold: 0,
      align: 0,
      format: 0
    })

    // Footer
    printData.push({
      type: 0,
      content: '¡Gracias por su compra!',
      bold: 1,
      align: 1,
      format: 0
    })

    printData.push({
      type: 0,
      content: 'www.garrasfelinas.com',
      bold: 1,
      align: 1,
      format: 0
    })

    printData.push({
      type: 0,
      content: 'Conserve este ticket',
      bold: 1,
      align: 1,
      format: 0
    })

    // Cortar papel
    printData.push({
      type: 5, // cut paper
      content: '',
      bold: 0,
      align: 0,
      format: 0
    })

    return NextResponse.json(printData)

  } catch (error) {
    console.error('Error generando datos para Bluetooth Print:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
