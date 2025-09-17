import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/lib/prisma'
import jsPDF from 'jspdf'

export async function GET(request: Request) {
  console.log('🚀 Iniciando generación de PDF...')
  
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    console.log('🔐 Sesión:', session?.user?.email ? 'OK' : 'NO AUTORIZADO')
    
    if (!session?.user?.email) {
      console.log('❌ No autorizado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    // Verificar rol
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'VENDEDOR' as any)) {
      console.log('❌ Acceso denegado')
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }
    
    console.log('✅ Usuario autorizado:', session.user.email)
    
    // Obtener parámetros
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') || 'dia'
    const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]
    
    console.log('📅 Parámetros:', { tipo, fecha })
    
    // Calcular fechas según el tipo
    let startDate: Date
    let endDate: Date
    
    if (tipo === 'dia') {
      startDate = new Date(fecha)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(fecha)
      endDate.setHours(23, 59, 59, 999)
    } else if (tipo === 'semana') {
      startDate = new Date(fecha)
      startDate.setDate(startDate.getDate() - startDate.getDay())
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
    } else { // mes
      startDate = new Date(fecha)
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0)
      endDate.setHours(23, 59, 59, 999)
    }
    
    console.log('📊 Obteniendo ventas físicas...')
    
    // Obtener ventas físicas con datos completos
    const ventas = await prisma.order.findMany({
      where: {
        orderType: 'FISICA',
        status: { not: 'CANCELLED' },
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, price: true, barcode: true } },
            variant: { select: { size: true, color: true, price: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📈 Ventas encontradas: ${ventas.length}`)
    
    // Calcular estadísticas
    const totalVentas = ventas.length
    const totalIngresos = ventas.reduce((sum, v) => sum + (v.total || 0), 0)
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0
    const ventasEfectivo = ventas.filter(v => v.paymentMethod === 'EFECTIVO').length
    const ventasTarjeta = ventas.filter(v => v.paymentMethod === 'TARJETA').length
    const ingresosEfectivo = ventas.filter(v => v.paymentMethod === 'EFECTIVO').reduce((sum, v) => sum + (v.total || 0), 0)
    const ingresosTarjeta = ventas.filter(v => v.paymentMethod === 'TARJETA').reduce((sum, v) => sum + (v.total || 0), 0)
    const totalProductos = ventas.reduce((sum, v) => sum + (v.items?.length || 0), 0)
    
    console.log('📊 Estadísticas calculadas')
    
    // Crear PDF con datos reales
    console.log('📄 Creando PDF con datos reales...')
    const doc = new jsPDF()
    
    // Título principal
    doc.setFontSize(18)
    doc.text('REPORTE DE VENTAS FÍSICAS', 105, 20, { align: 'center' })
    
    // Información del período
    doc.setFontSize(12)
    doc.text(`Período: ${tipo.toUpperCase()} - ${fecha}`, 105, 35, { align: 'center' })
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 45, { align: 'center' })
    
    // Línea separadora
    doc.line(20, 50, 190, 50)
    
    // Estadísticas principales
    doc.setFontSize(14)
    doc.text('ESTADÍSTICAS GENERALES', 20, 65)
    
    doc.setFontSize(11)
    doc.text(`• Total de ventas: ${totalVentas}`, 20, 80)
    doc.text(`• Ingresos totales: $${totalIngresos.toFixed(2)} MXN`, 20, 90)
    doc.text(`• Promedio por venta: $${promedioVenta.toFixed(2)} MXN`, 20, 100)
    doc.text(`• Total productos vendidos: ${totalProductos}`, 20, 110)
    
    // Estadísticas por método de pago
    doc.text(`• Ventas en efectivo: ${ventasEfectivo} ($${ingresosEfectivo.toFixed(2)})`, 20, 125)
    doc.text(`• Ventas con tarjeta: ${ventasTarjeta} ($${ingresosTarjeta.toFixed(2)})`, 20, 135)
    
    // Línea separadora
    doc.line(20, 145, 190, 145)
    
    // Detalle de ventas
    doc.setFontSize(14)
    doc.text('DETALLE DE VENTAS', 20, 160)
    
    let yPos = 175
    let ventaIndex = 0
    
    ventas.forEach((venta, index) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      
      ventaIndex++
      doc.setFontSize(10)
      doc.text(`${ventaIndex}. Venta ID: ${venta.id.substring(0, 12)}...`, 20, yPos)
      yPos += 8
      
      doc.setFontSize(9)
      doc.text(`   Fecha: ${new Date(venta.createdAt).toLocaleDateString('es-ES')} ${new Date(venta.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 25, yPos)
      yPos += 6
      doc.text(`   Vendedor: ${venta.user?.name || 'N/A'}`, 25, yPos)
      yPos += 6
      doc.text(`   Email: ${venta.user?.email || 'N/A'}`, 25, yPos)
      yPos += 6
      doc.text(`   Método pago: ${venta.paymentMethod || 'N/A'}`, 25, yPos)
      yPos += 6
      doc.text(`   Total: $${(venta.total || 0).toFixed(2)} MXN`, 25, yPos)
      yPos += 6
      doc.text(`   Productos: ${venta.items?.length || 0}`, 25, yPos)
      yPos += 6
      
      // Detalle de productos si hay pocas ventas
      if (ventas.length <= 10 && venta.items && venta.items.length > 0) {
        doc.text(`   Productos:`, 25, yPos)
        yPos += 6
        
        venta.items.forEach((item, itemIndex) => {
          if (yPos > 280) {
            doc.addPage()
            yPos = 20
          }
          
          const productoNombre = item.product?.name || 'Producto no encontrado'
          const variante = item.variant ? ` (${item.variant.size || ''} ${item.variant.color || ''})`.trim() : ''
          const codigo = item.variant ? 
            `${item.product?.barcode || 'N/A'}-${item.variant.size || ''}-${item.variant.color || ''}` : 
            item.product?.barcode || 'N/A'
          
          doc.text(`     ${itemIndex + 1}. ${productoNombre}${variante}`, 30, yPos)
          yPos += 5
          doc.text(`        Código: ${codigo}`, 30, yPos)
          yPos += 5
          doc.text(`        Cantidad: ${item.quantity || 0} x $${(item.price || 0).toFixed(2)} = $${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`, 30, yPos)
          yPos += 8
        })
      }
      
      yPos += 8
    })
    
    if (ventas.length > 15) {
      doc.text(`... y ${ventas.length - 15} ventas más`, 20, yPos)
    }
    
    // Resumen final
    if (ventas.length > 0) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text('RESUMEN EJECUTIVO', 105, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.text(`Período analizado: ${tipo.toUpperCase()} del ${fecha}`, 20, 40)
      doc.text(`Total de transacciones: ${totalVentas}`, 20, 55)
      doc.text(`Ingresos brutos: $${totalIngresos.toFixed(2)} MXN`, 20, 70)
      doc.text(`Ticket promedio: $${promedioVenta.toFixed(2)} MXN`, 20, 85)
      doc.text(`Productos vendidos: ${totalProductos}`, 20, 100)
      
      doc.text('Distribución por método de pago:', 20, 120)
      doc.text(`• Efectivo: ${ventasEfectivo} ventas (${totalVentas > 0 ? ((ventasEfectivo/totalVentas)*100).toFixed(1) : 0}%)`, 30, 135)
      doc.text(`• Tarjeta: ${ventasTarjeta} ventas (${totalVentas > 0 ? ((ventasTarjeta/totalVentas)*100).toFixed(1) : 0}%)`, 30, 150)
      
      doc.text(`Reporte generado el: ${new Date().toLocaleString('es-ES')}`, 20, 180)
    }
    
    console.log('✅ PDF con datos reales creado exitosamente')
    
    // Generar buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    console.log('📦 Buffer generado, tamaño:', pdfBuffer.length)
    
    // Nombre del archivo
    const nombreArchivo = `ventas-fisicas-${tipo}-${fecha}.pdf`
    console.log('📁 Nombre archivo:', nombreArchivo)
    
    // Retornar PDF
    console.log('🚀 Enviando PDF...')
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
    
  } catch (error) {
    console.log('❌ Error:', error)
    log.error('Error al generar reporte PDF:', error)
    return NextResponse.json({ 
      error: 'Error al generar reporte PDF',
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}