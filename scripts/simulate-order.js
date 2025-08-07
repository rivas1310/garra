/**
 * Script para simular una orden y descontar stock manualmente
 * Uso: node scripts/simulate-order.js <productId> <quantity>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateOrder(productId, quantity) {
  try {
    if (!productId || !quantity) {
      console.error('Error: Debe proporcionar productId y quantity.');
      console.log('Uso: node scripts/simulate-order.js <productId> <quantity>');
      return;
    }
    
    console.log(`Simulando orden para producto ${productId}, cantidad: ${quantity}\n`);
    
    // Verificar si el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true
      }
    });
    
    if (!product) {
      console.error(`Error: No se encontró el producto con ID: ${productId}`);
      return;
    }
    
    console.log(`Producto: ${product.name}`);
    console.log(`Stock principal: ${product.stock}`);
    
    if (product.variants && product.variants.length > 0) {
      console.log('Variantes:');
      product.variants.forEach(variant => {
        console.log(`  - ${variant.color} ${variant.size}: ${variant.stock} unidades`);
      });
    }
    
    // Buscar o crear usuario invitado
    let guestUser = await prisma.user.findFirst({
      where: { email: 'guest@bazar.com' }
    });

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          email: 'guest@bazar.com',
          name: 'Usuario Invitado',
          role: 'USER',
          hashedPassword: 'guest_password_hash'
        }
      });
      console.log('Usuario invitado creado');
    }
    
    // Crear la orden
    const order = await prisma.order.create({
      data: {
        userId: guestUser.id,
        status: 'CONFIRMED',
        total: product.price * quantity,
        subtotal: product.price * quantity,
        tax: 0,
        shipping: 0,
        paymentStatus: 'PAID',
        notes: 'Orden simulada para prueba de stock',
        items: {
          create: [{
            productId: productId,
            variantId: product.variants && product.variants.length > 0 ? product.variants[0].id : null,
            quantity: quantity,
            price: product.price
          }]
        }
      }
    });
    
    console.log(`\n✅ Orden creada: ${order.id}`);
    
    // Obtener los items de la orden
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: {
        product: true,
        variant: true
      }
    });
    
    console.log(`\n📋 Items en la orden: ${orderItems.length}`);
    
    // Descontar el stock de cada item
    for (const item of orderItems) {
      console.log(`\n📦 Descontando stock para: ${item.product.name} - Cantidad: ${item.quantity}`);
      
      if (item.variantId) {
        // Si tiene variante, descontar del stock de la variante
        const updatedVariant = await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
        console.log(`✅ Stock de variante descontado: ${item.variantId}, nuevo stock: ${updatedVariant.stock}`);
        
        // Si el stock de la variante llega a 0, verificar si desactivar el producto
        if (updatedVariant.stock <= 0) {
          // Verificar si todas las variantes del producto tienen stock 0
          const allVariants = await prisma.productVariant.findMany({
            where: { productId: item.productId }
          });
          
          const allOutOfStock = allVariants.every(v => v.stock <= 0);
          
          if (allOutOfStock) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { isActive: false }
            });
            console.log(`⚠️ Producto ${item.product.name} desactivado - sin stock disponible`);
          }
        }
      } else {
        // Si no tiene variante, descontar del stock principal del producto
        const updatedProduct = await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
        console.log(`✅ Stock de producto descontado: ${item.productId}, nuevo stock: ${updatedProduct.stock}`);
        
        // Si el stock llega a 0, desactivar el producto
        if (updatedProduct.stock <= 0) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { isActive: false }
          });
          console.log(`⚠️ Producto ${item.product.name} desactivado - sin stock disponible`);
        }
      }
      
      console.log(`✅ Item procesado: ${item.product.name} - Cantidad: ${item.quantity}`);
    }
    
    console.log('\n✅ Orden simulada completada - stock descontado correctamente');
    
  } catch (error) {
    console.error('Error al simular orden:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener los argumentos de línea de comandos
const productId = process.argv[2];
const quantity = parseInt(process.argv[3]);
simulateOrder(productId, quantity); 