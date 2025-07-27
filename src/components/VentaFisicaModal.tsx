'use client'

import { useState, useEffect } from 'react'
import { X, Search, Camera, Keyboard, ShoppingCart } from 'lucide-react'
import BarcodeScanner from './BarcodeScanner'

interface VentaFisicaModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  barcode?: string
}

export default function VentaFisicaModal({ isOpen, onClose }: VentaFisicaModalProps) {
  const [showScanner, setShowScanner] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<{ [key: string]: { product: Product; quantity: number } }>({})

  // Buscar producto por código de barras
  const searchProductByBarcode = async (barcode: string) => {
    if (!barcode.trim()) return

    setLoading(true)
    setError(null)

    // Limpiar y normalizar el código
    const cleanBarcode = barcode
      .trim()
      .replace(/[\r\n\t]/g, '') // Remover saltos de línea, retornos de carro y tabulaciones
      .replace(/\s+/g, '') // Remover espacios múltiples
      .replace(/[^\w\d]/g, '') // Solo mantener letras y números

    // Logging para debugging
    console.log('🔍 Buscando producto con código:', {
      original: barcode,
      cleaned: cleanBarcode,
      originalLength: barcode.trim().length,
      cleanedLength: cleanBarcode.length,
      type: typeof barcode,
      hasSpecialChars: /[\r\n\t\s]/.test(barcode)
    })

    if (cleanBarcode.length < 3) {
      setError('Código de barras demasiado corto')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/productos/barcode/${encodeURIComponent(cleanBarcode)}`)
      
      console.log('📡 Respuesta de la API:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      })
      
      if (response.ok) {
        const product = await response.json()
        console.log('✅ Producto encontrado:', {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          barcodeLength: product.barcode?.length
        })
        addToCart(product)
        setManualBarcode('')
      } else if (response.status === 404) {
        const errorData = await response.json()
        console.log('❌ Producto no encontrado:', errorData)
        
        // Mostrar sugerencias si están disponibles
        if (errorData.suggestions && errorData.suggestions.length > 0) {
          setError(`Producto no encontrado. Sugerencias: ${errorData.suggestions.map((s: any) => s.name).join(', ')}`)
        } else {
          setError(`Producto no encontrado con el código: ${cleanBarcode}`)
        }
      } else {
        const errorData = await response.json()
        console.log('❌ Error de API:', errorData)
        setError('Error al buscar el producto')
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err)
      setError('Error de conexión al buscar el producto')
    } finally {
      setLoading(false)
    }
  }

  // Buscar productos por nombre
  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setProducts([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/productos?search=${encodeURIComponent(term.trim())}`)
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        setError('Error al buscar productos')
      }
    } catch (err) {
      console.error('Error al buscar productos:', err)
      setError('Error de conexión al buscar productos')
    } finally {
      setLoading(false)
    }
  }

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev[product.id]
      return {
        ...prev,
        [product.id]: {
          product,
          quantity: existing ? existing.quantity + 1 : 1
        }
      }
    })
    setError(null)
  }

  // Remover producto del carrito
  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      delete newCart[productId]
      return newCart
    })
  }

  // Actualizar cantidad
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity
      }
    }))
  }

  // Calcular total
  const total = Object.values(cart).reduce((sum, item) => {
    return sum + (item.product.price * item.quantity)
  }, 0)

  // Manejar escaneo de código de barras
  const handleBarcodeScan = (barcode: string) => {
    console.log('🎯 Modal recibió código del escáner:', {
      barcode,
      length: barcode.length,
      type: typeof barcode,
      bytes: Array.from(barcode).map(c => c.charCodeAt(0))
    })
    
    setShowScanner(false)
    searchProductByBarcode(barcode)
  }

  // Manejar envío de código manual
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchProductByBarcode(manualBarcode)
  }

  // Buscar productos cuando cambie el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-4 bg-primary-600 text-white flex justify-between items-center">
            <h3 className="text-lg font-medium">Venta Física</h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Panel izquierdo - Búsqueda y productos */}
            <div className="w-1/2 p-4 border-r border-neutral-200 overflow-y-auto">
              <div className="space-y-4">
                {/* Búsqueda por código de barras */}
                <div>
                  <h4 className="font-medium text-neutral-700 mb-2">Código de Barras</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowScanner(true)}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Escanear
                    </button>
                    <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        placeholder="Ingresa código manualmente"
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="submit"
                        disabled={loading || !manualBarcode.trim()}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-neutral-300 text-white rounded-lg transition-colors flex items-center"
                      >
                        <Keyboard className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Búsqueda por nombre */}
                <div>
                  <h4 className="font-medium text-neutral-700 mb-2">Buscar Productos</h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre..."
                      className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Lista de productos */}
                <div>
                  <h4 className="font-medium text-neutral-700 mb-2">Productos Encontrados</h4>
                  {loading ? (
                    <div className="text-center py-4 text-neutral-500">
                      Buscando productos...
                    </div>
                  ) : products.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                          onClick={() => addToCart(product)}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-neutral-600">
                            ${product.price.toFixed(2)} - Stock: {product.stock}
                          </div>
                          {product.barcode && (
                            <div className="text-xs text-neutral-500">
                              Código: {product.barcode}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : searchTerm && (
                    <div className="text-center py-4 text-neutral-500">
                      No se encontraron productos
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel derecho - Carrito */}
            <div className="w-1/2 p-4 overflow-y-auto">
              <h4 className="font-medium text-neutral-700 mb-4">Carrito de Venta</h4>
              
              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
                  <p>El carrito está vacío</p>
                  <p className="text-sm">Busca productos para agregarlos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([productId, item]) => (
                    <div key={productId} className="p-3 border border-neutral-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-neutral-600">
                            ${item.product.price.toFixed(2)} c/u
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                            className="w-6 h-6 bg-neutral-200 hover:bg-neutral-300 rounded flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            className="w-6 h-6 bg-neutral-200 hover:bg-neutral-300 rounded flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <div className="font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex justify-between items-center text-lg font-medium">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Aquí implementarías la lógica de finalizar venta
                      alert('Funcionalidad de finalizar venta en desarrollo')
                    }}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Finalizar Venta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal del escáner */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}