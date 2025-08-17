import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        total: true,
        subtotal: true,
        tax: true,
        shipping: true,
        discount: true,
        createdAt: true,
        updatedAt: true,
        notes: true,
        paymentStatus: true,
        shippingLabelUrl: true,
        trackingNumber: true,
        shippingProvider: true,
        shippingCost: true,
        shippingData: true,
        // Campos del cliente
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerStreet: true,
        customerNumberExterior: true,
        customerNumberInterior: true,
        customerColonia: true,
        customerCity: true,
        customerState: true,
        customerPostalCode: true,
        customerCountry: true,
        customerReferences: true,
        user: {
          select: {
            email: true,
            name: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                price: true
              }
            },
            variant: {
              select: {
                size: true,
                color: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Debug: Verificar qué datos estamos devolviendo
    log.error("🔍 Pedido encontrado:", {
      id: order.id,
      hasShippingAddress: !!order.shippingAddress,
      hasUser: !!order.user,
      shippingAddress: order.shippingAddress,
      user: order.user
    });

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
    const { 
      status, 
      notes, 
      trackingNumber, 
      shippingProvider, 
      shippingCost,
      shippingData 
    } = body

    // Validar que el pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Preparar datos para actualizar
    const updateData: any = {
      updatedAt: new Date()
    }

    // Solo actualizar campos que se proporcionaron
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (shippingProvider !== undefined) updateData.shippingProvider = shippingProvider
    if (shippingCost !== undefined) updateData.shippingCost = shippingCost
    if (shippingData !== undefined) updateData.shippingData = shippingData

    log.error(`Actualizando pedido ${id} con datos:`, updateData)

    // Actualizar el pedido
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
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
            },
            variant: {
              select: {
                size: true,
                color: true
              }
            }
          }
        }
      }
    })

    log.error(`Pedido ${id} actualizado exitosamente`)

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    })
  } catch (error) {
    log.error(`Error al actualizar pedido ${await (await params).id}:`, error)
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