import prisma from './prisma';

/**
 * Genera un código de barras único para un producto
 * Formato: PRD + timestamp + 4 dígitos aleatorios
 */
export async function generateUniqueBarcode(): Promise<string> {
  let barcode: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generar código de barras: PRD + timestamp + 4 dígitos aleatorios
    const timestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos del timestamp
    const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    barcode = `PRD${timestamp}${randomDigits}`;

    // Verificar que el código de barras sea único
    const existingProduct = await prisma.product.findUnique({
      where: { barcode },
    });

    if (!existingProduct) {
      isUnique = true;
    } else {
      attempts++;
    }
  }

  if (!isUnique) {
    throw new Error('No se pudo generar un código de barras único después de varios intentos');
  }

  return barcode!;
}

/**
 * Busca un producto por su código de barras
 */
export async function findProductByBarcode(barcode: string) {
  return await prisma.product.findUnique({
    where: { barcode },
    include: {
      category: true,
      variants: true,
    },
  });
}

/**
 * Valida si un código de barras tiene el formato correcto
 */
export function isValidBarcodeFormat(barcode: string): boolean {
  // Formato esperado: PRD + 8 dígitos + 4 dígitos = 15 caracteres
  const barcodeRegex = /^PRD\d{12}$/;
  return barcodeRegex.test(barcode);
}

/**
 * Genera un código de barras manual (para casos especiales)
 */
export function generateManualBarcode(prefix: string = 'PRD'): string {
  const timestamp = Date.now().toString().slice(-8);
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${randomDigits}`;
} 