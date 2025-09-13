/**
 * Utilidades para búsqueda de texto normalizada
 * Permite buscar ignorando acentos, tildes, mayúsculas y minúsculas
 */

/**
 * Normaliza un texto removiendo acentos y convirtiendo a minúsculas
 * @param text - El texto a normalizar
 * @returns El texto normalizado
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remueve los acentos y tildes
    .trim();
}

/**
 * Verifica si un texto contiene otro texto de forma normalizada
 * @param searchIn - El texto donde buscar
 * @param searchFor - El texto a buscar
 * @returns true si encuentra coincidencia, false caso contrario
 */
export function normalizedIncludes(searchIn: string, searchFor: string): boolean {
  if (!searchIn || !searchFor) return false;
  
  const normalizedSearchIn = normalizeText(searchIn);
  const normalizedSearchFor = normalizeText(searchFor);
  
  return normalizedSearchIn.includes(normalizedSearchFor);
}

/**
 * Busca un término en múltiples campos de un objeto
 * @param searchTerm - El término a buscar
 * @param fields - Array de strings con los campos donde buscar
 * @returns true si encuentra coincidencia en algún campo
 */
export function searchInFields(searchTerm: string, fields: string[]): boolean {
  if (!searchTerm) return true; // Si no hay término, mostrar todo
  
  return fields.some(field => normalizedIncludes(field || '', searchTerm));
}

/**
 * Filtra un array de productos basado en un término de búsqueda normalizado
 * @param products - Array de productos
 * @param searchTerm - Término de búsqueda
 * @returns Array filtrado de productos
 */
export function filterProductsBySearch(products: any[], searchTerm: string): any[] {
  if (!searchTerm || searchTerm.trim() === '') return products;
  
  return products.filter(product => {
    const fieldsToSearch = [
      product.name,
      product.description,
      product.category?.name,
      product.subcategoria,
      product.barcode,
      // También buscar en variantes si existen
      ...(product.variants?.map((v: any) => `${v.size} ${v.color}`) || [])
    ];
    
    return searchInFields(searchTerm, fieldsToSearch);
  });
}

