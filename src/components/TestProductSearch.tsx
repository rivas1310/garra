'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  barcode?: string
  variants?: any[]
}

export default function TestProductSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = async (term: string) => {
    console.log('🔍 TEST - searchProducts llamada con término:', term)
    
    if (!term.trim()) {
      console.log('❌ TEST - Término vacío, limpiando productos')
      setProducts([])
      return
    }

    setLoading(true)
    setError(null)
    console.log('⏳ TEST - Iniciando búsqueda...')

    try {
      const url = `/api/productos?search=${encodeURIComponent(term.trim())}&limit=50&admin=true`
      console.log('🌐 TEST - URL de búsqueda:', url)
      
      const response = await fetch(url)
      console.log('📡 TEST - Respuesta recibida:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 TEST - Datos recibidos:', {
          hasProductos: !!data.productos,
          productosLength: data.productos?.length || 0,
          totalPagination: data.pagination?.total || 0
        })
        
        const productos = data.productos || []
        console.log('🔍 TEST - Productos encontrados:', productos)
        
        setProducts(productos)
        console.log('✅ TEST - Estado actualizado - products.length:', productos.length)
      } else {
        console.log('❌ TEST - Error en respuesta:', response.status)
        setError('Error al buscar productos')
      }
    } catch (err) {
      console.log('❌ TEST - Error al buscar productos:', err)
      setError('Error de conexión al buscar productos')
    } finally {
      setLoading(false)
      console.log('🏁 TEST - Búsqueda finalizada')
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h2 className="text-xl font-bold mb-4">TEST - Búsqueda de Productos</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4 text-sm text-blue-600">
        DEBUG: products.length = {products.length}, searchTerm = "{searchTerm}", loading = {loading.toString()}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-gray-500">
          Buscando productos...
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-semibold">Productos encontrados ({products.length}):</h3>
          {products.map((product) => (
            <div
              key={product.id}
              className="p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-600">
                ${product.price.toFixed(2)} - Stock: {product.stock}
              </div>
              {product.variants && product.variants.length > 0 && (
                <div className="text-xs text-blue-600">
                  {product.variants.length} variante(s) disponible(s)
                </div>
              )}
              {product.barcode && (
                <div className="text-xs text-gray-500">
                  Código: {product.barcode}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : searchTerm && (
        <div className="text-center py-4 text-gray-500">
          No se encontraron productos
        </div>
      )}
    </div>
  )
}