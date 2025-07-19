import { prisma } from './prisma';

/**
 * Actualiza el stock de un producto y lo desactiva automáticamente si llega a 0
 */
export async function updateProductStock(productId: string, newStock: number) {
  try {
    console.log(`Actualizando stock del producto ${productId} a ${newStock}`);
    
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        isActive: newStock > 0, // Desactiva automáticamente si stock es 0
      },
    });

    console.log(`Producto ${productId} actualizado: stock=${product.stock}, isActive=${product.isActive}`);
    return product;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
}

/**
 * Actualiza el stock de una variante de producto
 */
export async function updateProductVariantStock(variantId: string, newStock: number) {
  try {
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });

    // Verificar si todas las variantes del producto tienen stock 0
    const allVariants = await prisma.productVariant.findMany({
      where: { productId: variant.productId },
    });

    const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
    const productStock = await prisma.product.findUnique({
      where: { id: variant.productId },
      select: { stock: true },
    });

    // Si el producto tiene stock propio, sumarlo al total
    const finalTotalStock = totalStock + (productStock?.stock || 0);

    // Actualizar el stock del producto y su estado activo
    await prisma.product.update({
      where: { id: variant.productId },
      data: {
        stock: finalTotalStock,
        isActive: finalTotalStock > 0,
      },
    });

    return variant;
  } catch (error) {
    console.error('Error updating product variant stock:', error);
    throw error;
  }
}

/**
 * Verifica y actualiza el estado activo de todos los productos basado en su stock
 */
export async function syncProductActiveStatus() {
  try {
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
    });

    let updatedCount = 0;

    for (const product of products) {
      // Calcular stock total (producto + variantes)
      const variantStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
      const totalStock = product.stock + variantStock;
      const shouldBeActive = totalStock > 0;

      console.log(`Producto ${product.id}: stock actual=${product.stock}, variantes=${variantStock}, total=${totalStock}, isActive actual=${product.isActive}, debería ser=${shouldBeActive}`);

      // Actualizar si el estado actual no coincide con el esperado
      if (product.isActive !== shouldBeActive) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            isActive: shouldBeActive,
            stock: totalStock, // Sincronizar también el stock total
          },
        });
        updatedCount++;
        console.log(`Producto ${product.id} actualizado: isActive=${shouldBeActive}`);
      }
    }

    console.log(`Sincronización completada: ${updatedCount} productos actualizados`);
    return updatedCount;
  } catch (error) {
    console.error('Error syncing product active status:', error);
    throw error;
  }
}

/**
 * Obtiene productos activos (solo filtrado por isActive, no por stock)
 */
export async function getActiveProducts() {
  return await prisma.product.findMany({
    where: {
      isActive: true, // Solo filtrar por estado activo
    },
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Obtiene todos los productos (activos e inactivos) para el admin
 */
export async function getAllProducts() {
  return await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Verifica si un producto está disponible para compra
 */
export async function isProductAvailable(productId: string, quantity: number = 1) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true,
    },
  });

  if (!product || !product.isActive) {
    return false;
  }

  const totalStock = product.stock + product.variants.reduce((sum, v) => sum + v.stock, 0);
  return totalStock >= quantity;
} 