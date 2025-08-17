import { prisma } from './prisma';
import { log } from '@/lib/secureLogger'

/**
 * Actualiza el stock de un producto y lo desactiva automáticamente si llega a 0
 */
export async function updateProductStock(productId: string, newStock: number) {
  try {
    log.error(`Actualizando stock del producto ${productId} a ${newStock}`);
    
    // Obtener las variantes del producto para calcular el stock total
    const productWithVariants = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });
    
    if (!productWithVariants) {
      throw new Error('Producto no encontrado');
    }
    
    // Calcular si el producto debe estar activo
    // Si tiene variantes, depende EXCLUSIVAMENTE del stock de las variantes
    // Si no tiene variantes, depende del stock principal
    const variantStock = productWithVariants.variants.reduce((sum, v) => sum + v.stock, 0);
    const shouldBeActive = productWithVariants.variants.length > 0 ? 
      variantStock > 0 : newStock > 0;
    
    log.error(`Stock principal: ${newStock}, Stock variantes: ${variantStock}, Activo: ${shouldBeActive}`);
    
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        isActive: shouldBeActive, // Activar/desactivar basado en stock disponible
      },
    });

    log.error(`Producto ${productId} actualizado: stock=${product.stock}, isActive=${product.isActive}`);
    return product;
  } catch (error) {
    log.error('Error updating product stock:', error);
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

    // Calcular el stock total solo de las variantes
    const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
    
    // Calcular si el producto debe estar activo basado únicamente en el stock de variantes
    // No sumamos el stock principal al total para evitar duplicación
    const isProductActive = totalStock > 0;

    // Actualizar tanto el stock como el estado activo del producto principal
    await prisma.product.update({
      where: { id: variant.productId },
      data: {
        stock: totalStock, // Actualizar el stock del producto principal
        isActive: totalStock > 0, // Activar/desactivar basado en el stock total
      },
    });

    log.error(`✅ Stock de variante actualizado: ${variantId}, nuevo stock: ${newStock}`);
    log.error(`✅ Stock total del producto actualizado: ${variant.productId}, nuevo stock total: ${totalStock}`);

    return variant;
  } catch (error) {
    log.error('Error updating product variant stock:', error);
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
      // Calcular stock total (solo de variantes, sin sumar el stock principal)
      const variantStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
      // Si hay variantes, el estado activo depende EXCLUSIVAMENTE del stock de variantes
      // Si no hay variantes, depende del stock principal
      const shouldBeActive = product.variants.length > 0 ? variantStock > 0 : product.stock > 0;

      log.error(`Producto ${product.id}: stock principal=${product.stock}, variantes=${variantStock}, isActive actual=${product.isActive}, debería ser=${shouldBeActive}`);

      // Actualizar si el estado actual no coincide con el esperado
      if (product.isActive !== shouldBeActive) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            isActive: shouldBeActive,
            // No modificamos el stock principal para evitar duplicación
            // Cada variante mantiene su propio stock independiente
          },
        });
        updatedCount++;
        log.error(`Producto ${product.id} actualizado: isActive=${shouldBeActive}`);
      }
    }

    log.error(`Sincronización completada: ${updatedCount} productos actualizados`);
    return updatedCount;
  } catch (error) {
    log.error('Error syncing product active status:', error);
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

  // Calcular el stock total correctamente
  let totalStock;
  if (product.variants && product.variants.length > 0) {
    // Si el producto tiene variantes, usar solo el stock de las variantes
    totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  } else {
    // Si no tiene variantes, usar el stock principal
    totalStock = product.stock;
  }
  
  return totalStock >= quantity;
}