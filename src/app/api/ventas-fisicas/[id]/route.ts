import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    // Verificar autenticación (solo administradores pueden ver ventas físicas)
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    // Verificar si el usuario es administrador o vendedor
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'VENDEDOR' as any)) {
      return NextResponse.json({ error: 'Acceso denegado. Se requiere rol de Administrador o Vendedor' }, { status: 403 })
    }
    
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'ID de venta no proporcionado' }, { status: 400 })
    }
    
    // Obtener la venta física específica
    const ventaFisica = await prisma.order.findUnique({
      where: {
        id,
        orderType: 'FISICA'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        }
      }
    })
    
    if (!ventaFisica) {
      return NextResponse.json({ error: 'Venta física no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(ventaFisica)
    
  } catch (error) {
    log.error('Error al obtener detalles de venta física:', error)
    return NextResponse.json({ 
      error: 'Error al obtener detalles de venta física', 
      detalle: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}