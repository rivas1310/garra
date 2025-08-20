/**
 * Calcula el dígito de verificación para códigos EAN-13
 */
function calculateEAN13CheckDigit(code: string): string {
  const digits = code.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0) {
      sum += digits[i];
    } else {
      sum += digits[i] * 3;
    }
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

/**
 * Genera un código EAN-13 único para un producto (solo cliente)
 * Formato: 200 + 9 dígitos + dígito de verificación = 13 dígitos total
 * NOTA: Esta función genera el código pero no verifica unicidad en la base de datos
 */
export function generateUniqueEAN13(): string {
  // Prefijo 200 para productos internos + 9 dígitos aleatorios
  const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const baseCode = `200${randomDigits}`;
  const checkDigit = calculateEAN13CheckDigit(baseCode);
  return `${baseCode}${checkDigit}`;
}

/**
 * Genera un código de barras único para un producto (formato original - solo cliente)
 * Formato: PRD + timestamp + 4 dígitos aleatorios
 * NOTA: Esta función genera el código pero no verifica unicidad en la base de datos
 */
export function generateUniqueBarcode(): string {
  // Generar código de barras: PRD + timestamp + 4 dígitos aleatorios
  const timestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos del timestamp
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PRD${timestamp}${randomDigits}`;
}

/**
 * Valida si un código EAN-13 es válido
 */
export function isValidEAN13(barcode: string): boolean {
  // Debe tener exactamente 13 dígitos
  if (!/^\d{13}$/.test(barcode)) {
    return false;
  }
  
  // Verificar el dígito de control
  const baseCode = barcode.slice(0, 12);
  const providedCheckDigit = barcode.slice(12);
  const calculatedCheckDigit = calculateEAN13CheckDigit(baseCode);
  
  return providedCheckDigit === calculatedCheckDigit;
}

/**
 * Valida si un código de barras tiene el formato correcto (PRD o EAN-13)
 */
export function isValidBarcodeFormat(barcode: string): boolean {
  // Formato PRD: PRD + 8 dígitos + 4 dígitos = 15 caracteres
  const prdBarcodeRegex = /^PRD\d{12}$/;
  
  // Formato EAN-13: 13 dígitos
  const ean13Regex = /^\d{13}$/;
  
  // Validar formato PRD
  if (prdBarcodeRegex.test(barcode)) {
    return true;
  }
  
  // Validar formato EAN-13
  if (ean13Regex.test(barcode)) {
    return isValidEAN13(barcode);
  }
  
  return false;
}

/**
 * Genera un código EAN-13 manual (para casos especiales)
 */
export function generateManualEAN13(): string {
  // Prefijo 200 para productos internos + 9 dígitos aleatorios
  const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const baseCode = `200${randomDigits}`;
  const checkDigit = calculateEAN13CheckDigit(baseCode);
  return `${baseCode}${checkDigit}`;
}

/**
 * Genera un código de barras manual (para casos especiales)
 * @param format - 'PRD' para formato original o 'EAN13' para formato EAN-13
 * @param prefix - Prefijo para formato PRD (por defecto 'PRD')
 */
export function generateManualBarcode(format: 'PRD' | 'EAN13' = 'PRD', prefix: string = 'PRD'): string {
  if (format === 'EAN13') {
    return generateManualEAN13();
  }
  
  // Formato PRD original
  const timestamp = Date.now().toString().slice(-8);
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${randomDigits}`;
}