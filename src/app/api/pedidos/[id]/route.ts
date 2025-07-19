import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
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
                images: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error al obtener pedido', 
      detalle: String(error) 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { status, notes } = body

    // Validar que el pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Actualizar el pedido
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status || existingOrder.status,
        notes: notes !== undefined ? notes : existingOrder.notes,
        updatedAt: new Date()
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
                images: true,
                price: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error al actualizar pedido', 
      detalle: String(error) 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Validar que el pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Eliminar items del pedido primero
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    })

    // Eliminar el pedido
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Pedido eliminado exitosamente' 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error al eliminar pedido', 
      detalle: String(error) 
    }, { status: 500 })
  }
} 