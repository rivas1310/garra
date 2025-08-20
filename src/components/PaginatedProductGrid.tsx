'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import ProductCard from './ProductCard'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating?: number
  reviewCount?: number
  isNew?: boolean
  isOnSale?: boolean
  isSecondHand?: boolean
  stock: number
  subcategoria?: string
  image: string
  isActive?: boolean
  isAvailable?: boolean
  totalStock?: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalProducts: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
}

interface PaginatedProductGridProps {
  categorySlug: string
  subcategoria?: string
  initialProducts?: Product[]
  pageSize?: number
}

export default function PaginatedProductGrid({
  categorySlug,
  subcategoria = '',
  initialProducts = [],
  pageSize = 12
}: PaginatedProductGridProps) {
  const [productos, setProductos] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar productos
  const loadProducts = useCallback(async (page: number, append: boolean = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        t: Date.now().toString() // Para evitar caché
      })

      if (subcategoria) {
        params.append('subcategoria', subcategoria)
      }

      const response = await fetch(`/api/categorias/${categorySlug}?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar productos')
      }

      const processedProducts = (data.productos || []).map((p: any) => ({
        ...p,
        image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/img/placeholder.png',
        stock: p.stock ?? 0,
        isActive: p.isActive ?? true,
        isAvailable: p.isAvailable ?? true,
        totalStock: p.totalStock ?? p.stock ?? 0,
        isNew: p.isNew,
        isOnSale: p.isOnSale,
        isSecondHand: p.isSecondHand,
      }))

      if (append) {
        setProductos(prev => [...prev, ...processedProducts])
      } else {
        setProductos(processedProducts)
      }

      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [categorySlug, subcategoria, pageSize])

  // Cargar productos iniciales
  useEffect(() => {
    if (initialProducts.length === 0) {
      loadProducts(1)
    } else {
      // Si hay productos iniciales, cargar la primera página con paginación para obtener info de paginación
      loadProducts(1)
    }
  }, [loadProducts, initialProducts.length])

  // Recargar cuando cambie la subcategoría
  useEffect(() => {
    setCurrentPage(1)
    loadProducts(1)
  }, [subcategoria, loadProducts])

  // Función para cargar más productos
  const loadMore = () => {
    if (pagination?.hasNextPage && !loadingMore) {
      loadProducts(currentPage + 1, true)
    }
  }

  if (loading && productos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">Cargando productos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => loadProducts(1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white mb-2">
          {subcategoria ? `No hay productos en la subcategoría "${subcategoria}"` : 'No hay productos en esta categoría'}
        </h3>
        <p className="text-white/80">Pronto agregaremos más productos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Grid de productos */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {productos.map((producto) => (
          <ProductCard key={producto.id} product={producto} />
        ))}
      </div>

      {/* Información de paginación y botón cargar más */}
      {pagination && (
        <div className="text-center space-y-4">
          <p className="text-white/80 text-sm">
            Mostrando {productos.length} de {pagination.totalProducts} productos
          </p>
          
          {pagination.hasNextPage && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto min-w-[200px]"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cargando...
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Cargar más productos
                </>
              )}
            </button>
          )}
          
          {!pagination.hasNextPage && productos.length > pageSize && (
            <p className="text-white/60 text-sm">
              ✅ Has visto todos los productos disponibles
            </p>
          )}
        </div>
      )}
    </div>
  )
}