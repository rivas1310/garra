'use client'
import { useState, useEffect } from 'react'

export function useInventario() {
  const [inventario, setInventario] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInventario = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener todos los productos para admin con límite alto
      const response = await fetch('/api/productos?admin=true&limit=1000')
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Transformar los datos de productos a formato de inventario
      const inventarioData = data.productos.map(producto => ({
        id: producto.id,
        nombre: producto.name,
        sku: producto.slug.toUpperCase(),
        categoria: producto.category?.name || 'Sin categoría',
        stock: producto.totalStock || producto.stock || 0,
        stockMinimo: 10, // Valor por defecto, se puede agregar a la BD después
        precio: producto.price,
        proveedor: 'Proveedor General', // Valor por defecto, se puede agregar a la BD después
        fechaVencimiento: null, // Se puede agregar a la BD después
        activo: producto.isActive,
        imagen: producto.images?.[0] || '/api/placeholder/60/60',
        // Datos adicionales del producto
        description: producto.description,
        originalPrice: producto.originalPrice,
        isOnSale: producto.isOnSale,
        conditionTag: producto.conditionTag,
        variants: producto.variants || [],
        subcategoria: producto.subcategoria
      }))
      
      setInventario(inventarioData)
    } catch (err) {
      console.error('Error al cargar inventario:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventario()
  }, [])

  const refreshInventario = () => {
    fetchInventario()
  }

  const updateProductStatus = async (productId, isActive) => {
    try {
      const response = await fetch(`/api/productos`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId, isActive })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el producto')
      }

      // Actualizar el estado local
      setInventario(prev => 
        prev.map(item => 
          item.id === productId 
            ? { ...item, activo: isActive }
            : item
        )
      )

      return true
    } catch (err) {
      console.error('Error al actualizar producto:', err)
      throw err
    }
  }

  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`/api/productos/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el producto')
      }

      // Remover del estado local
      setInventario(prev => prev.filter(item => item.id !== productId))

      return true
    } catch (err) {
      console.error('Error al eliminar producto:', err)
      throw err
    }
  }

  const updateProduct = async (productId, updates) => {
    try {
      const response = await fetch(`/api/productos`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId, ...updates })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el producto')
      }

      // Actualizar el estado local
      setInventario(prev => 
        prev.map(item => 
          item.id === productId 
            ? { ...item, ...updates }
            : item
        )
      )

      return true
    } catch (err) {
      console.error('Error al actualizar producto:', err)
      throw err
    }
  }

  return {
    inventario,
    loading,
    error,
    refreshInventario,
    updateProductStatus,
    deleteProduct,
    updateProduct
  }
}