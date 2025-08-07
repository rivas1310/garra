import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { productId, quantity, variantId } = await req.json()
    
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: 'Product ID y cantidad son requeridos' 
      }, { status: 400 })
    }
    
    console.log(`📦 Reservando stock: Producto ${productId}, Cantidad ${quantity}, Variante ${variantId || 'N/A'}`)
    
    // Verificar stock disponible
    let currentStock = 0
    let product = null
    
    if (variantId) {
      // Si tiene variante, verificar stock de la variante
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true }
      })
      
      if (!variant) {
        return NextResponse.json({ 
          error: 'Variante no encontrada' 
        }, { status: 404 })
      }
      
      currentStock = variant.stock
      product = variant.product
    } else {
      // Si no tiene variante, verificar stock del producto principal
      product = await prisma.product.findUnique({
        where: { id: productId }
      })
      
      if (!product) {
        return NextResponse.json({ 
          error: 'Producto no encontrado' 
        }, { status: 404 })
      }
      
      currentStock = product.stock
    }
    
    console.log(`📦 Stock actual: ${currentStock}`)
    
    // Verificar si hay suficiente stock
    if (currentStock < quantity) {
      return NextResponse.json({ 
        success: false,
        error: 'Stock insuficiente',
        availableStock: currentStock,
        requestedQuantity: quantity
      }, { status: 400 })
    }
    
    // Reservar stock (descontar temporalmente)
    try {
      if (variantId) {
        // Actualizar la variante
        const updatedVariant = await prisma.productVariant.update({
          where: { id: variantId },
          data: {
            stock: {
              decrement: quantity
            }
          }
        })
        console.log(`✅ Stock de variante reservado: ${variantId}, nuevo stock: ${updatedVariant.stock}`)
        
        // Actualizar el stock total se maneja en otro proceso
        // No es necesario actualizar totalStock aquí
      } else {
        // Actualizar el producto
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: quantity
            }
            // totalStock se maneja en otro proceso
          }
        })
        console.log(`✅ Stock de producto reservado: ${productId}, nuevo stock: ${updatedProduct.stock}`)
      }
      
      const newStock = currentStock - quantity
      console.log(`📦 Nuevo stock: ${newStock}`)
      
      return NextResponse.json({ 
        success: true,
        message: 'Stock reservado correctamente',
        reservedQuantity: quantity,
        newStock: newStock,
        productName: product.name
      })
      
    } catch (error) {
      console.error('❌ Error al reservar stock:', error)
      return NextResponse.json({ 
        error: 'Error al reservar stock',
        detalle: error instanceof Error ? error.message : String(error)
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Error en reserva de stock:', error)
    return NextResponse.json({ 
      error: 'Error al procesar la reserva de stock',
      detalle: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Endpoint para liberar stock (cuando se remueve del carrito o se cancela)
export async function PUT(req: Request) {
  try {
    const { productId, quantity, variantId } = await req.json()
    
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: 'Product ID y cantidad son requeridos' 
      }, { status: 400 })
    }
    
    console.log(`📦 Liberando stock: Producto ${productId}, Cantidad ${quantity}, Variante ${variantId || 'N/A'}`)
    
    // Liberar stock (incrementar)
    try {
      if (variantId) {
        // Actualizar la variante
        const updatedVariant = await prisma.productVariant.update({
          where: { id: variantId },
          data: {
            stock: {
              increment: quantity
            }
          }
        })
        console.log(`✅ Stock de variante liberado: ${variantId}, nuevo stock: ${updatedVariant.stock}`)
        
        // Actualizar el stock total se maneja en otro proceso
        // No es necesario actualizar totalStock aquí
      } else {
        // Actualizar el producto
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            stock: {
              increment: quantity
            }
            // totalStock se maneja en otro proceso
          }
        })
        console.log(`✅ Stock de producto liberado: ${productId}, nuevo stock: ${updatedProduct.stock}`)
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Stock liberado correctamente',
        releasedQuantity: quantity
      })
      
    } catch (error) {
      console.error('❌ Error al liberar stock:', error)
      return NextResponse.json({ 
        error: 'Error al liberar stock',
        detalle: error instanceof Error ? error.message : String(error)
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Error en liberación de stock:', error)
    return NextResponse.json({ 
      error: 'Error al procesar la liberación de stock',
      detalle: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}