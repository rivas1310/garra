# Conteos Reales de Subcategorías

## Descripción

Se ha implementado una funcionalidad para mostrar el conteo real de productos en cada subcategoría en lugar de usar números estáticos decorativos.

## Componentes Implementados

### 1. Hook Personalizado: `useSubcategoryCounts`

**Archivo:** `src/hooks/useSubcategoryCounts.ts`

- Obtiene el conteo real de productos por subcategoría desde la API
- Maneja estados de loading y error
- Retorna un objeto con los conteos de cada subcategoría

**Uso:**
```typescript
const { counts, loading, error } = useSubcategoryCounts(categoriaSlug)
```

### 2. API Endpoint: `/api/productos/subcategory-counts`

**Archivo:** `src/app/api/productos/subcategory-counts/route.ts`

- Recibe el parámetro `category` en la query string
- Consulta la base de datos para obtener conteos reales
- Retorna un objeto con conteos por subcategoría y total

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "category": "mujer",
  "counts": {
    "Vestidos": 12,
    "Blusas": 8,
    "Pantalones": 15
  },
  "total": 35
}
```

### 3. Componente Actualizado: `SubcategoryGrid`

**Archivo:** `src/components/SubcategoryGrid.tsx`

- Integra el hook `useSubcategoryCounts`
- Muestra conteos reales en lugar de números estáticos
- Incluye indicadores de loading y manejo de errores
- Muestra el total real de productos en la categoría

## Funcionalidades

### ✅ Conteos Reales
- Los números mostrados reflejan la cantidad real de productos en la base de datos
- Solo cuenta productos activos (`isActive: true`)

### ✅ Estados de Loading
- Muestra "..." mientras se cargan los datos
- Indicador visual de "Cargando productos..."

### ✅ Manejo de Errores
- Si hay error en la API, usa los conteos por defecto
- Muestra mensaje "Usando datos por defecto"

### ✅ Total de Categoría
- Muestra el total real de productos en toda la categoría
- Se actualiza automáticamente cuando cambian los datos

## Mapeo de Categorías

La API incluye un mapeo completo de categorías a subcategorías:

- **mujer**: Vestidos, Blusas, Pantalones, Pants, Conjunto, Suéter, Chaleco, Chamarras, Sudaderas, Sacos, Abrigos
- **hombre**: Camisas, Pantalones, Pants, Suéter, Chaleco, Chamarras, Sudaderas, Sacos, Abrigos
- **bebe**: Bodies, Pijamas, Conjuntos, Vestidos, Pantalones, Suéteres, Chalecos, Chamarras, Sudaderas, Sacos, Abrigos
- **nina**: Vestidos, Blusas, Pantalones, Pants, Conjuntos, Suéteres, Chalecos, Chamarras, Sudaderas, Sacos, Abrigos
- **nino**: Camisas, Pantalones, Pants, Suéteres, Chalecos, Chamarras, Sudaderas, Sacos, Abrigos
- **deportes**: Ropa deportiva, Zapatillas, Accesorios deportivos
- **calzado**: Tenis, Sneakers, Botas, Sandalias, Zapatos formales
- **accesorios**: Bolsas, Mochilas, Carteras, Cinturones, Relojes, Joyas

## Pruebas

### Script de Prueba
**Archivo:** `scripts/test-subcategory-counts.js`

Para probar la API:
```bash
node scripts/test-subcategory-counts.js
```

### Pruebas Manuales
1. Navegar a cualquier categoría en la tienda
2. Verificar que los números de productos sean reales
3. Verificar que se muestre el total correcto
4. Verificar estados de loading y error

## Beneficios

1. **Datos Reales**: Los usuarios ven información precisa y actualizada
2. **Mejor UX**: Indicadores de loading y manejo de errores
3. **Mantenibilidad**: Fácil de mantener y actualizar
4. **Escalabilidad**: Se adapta automáticamente a cambios en el inventario
5. **Performance**: Consultas optimizadas a la base de datos

## Consideraciones Técnicas

- **Caching**: Los conteos se obtienen en cada render del componente
- **Optimización**: Solo cuenta productos activos
- **Fallback**: En caso de error, usa datos por defecto
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## Futuras Mejoras

1. **Caching**: Implementar cache para evitar consultas repetidas
2. **Paginación**: Para categorías con muchos productos
3. **Filtros**: Conteos por rangos de precio, disponibilidad, etc.
4. **Analytics**: Tracking de productos más vistos por subcategoría
