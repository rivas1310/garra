'use client'

import { useState, useEffect } from 'react'
import { Search, QrCode, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { log } from '@/lib/secureLogger'
import TSPLPrinter from '@/components/TSPLPrinter'

interface Product {
  id: string
  name: string
  price: number
  sku?: string
  barcode?: string
  ean13?: string
  image?: string
  category?: {
    name: string
  }
}

interface SelectedProduct extends Product {
  quantity: number
}

export default function EtiquetasCodigosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/productos?admin=true&limit=1000')
      const data = await response.json()
      
      let productList = []
      if (Array.isArray(data)) {
        productList = data
      } else if (Array.isArray(data.productos)) {
        productList = data.productos
      } else if (Array.isArray(data.products)) {
        productList = data.products
      }
      
      // Filtrar solo productos con códigos de barras y mapear el campo images
      const productsWithBarcodes = productList
        .filter((product: any) => product.barcode)
        .map((product: any) => ({
          ...product,
          image: Array.isArray(product.images) && product.images.length > 0 
            ? product.images[0] 
            : null
        }))
      
      setProducts(productsWithBarcodes)
    } catch (error) {
      log.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.includes(searchTerm))
  )

  const addProduct = (product: Product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id)
    if (existingProduct) {
      setSelectedProducts(prev => 
        prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      )
    } else {
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }])
    }
    toast.success(`${product.name} agregado`)
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId)
      return
    }
    setSelectedProducts(prev => 
      prev.map(p => 
        p.id === productId 
          ? { ...p, quantity }
          : p
      )
    )
  }














  const clearSelection = () => {
    setSelectedProducts([])
  }

  const totalLabels = selectedProducts.reduce((sum, product) => sum + product.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-700">Etiquetas de Códigos de Barras</h1>
              <p className="text-sm sm:text-base text-neutral-600">Genera etiquetas EAN-13 de 51mm x 25mm con precio</p>
              

            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {selectedProducts.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="btn-secondary inline-flex items-center justify-center text-sm"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar ({totalLabels})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100">
              <div className="p-4 sm:p-6 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-700">Productos Disponibles</h2>
                  <span className="text-sm text-neutral-500">
                    {filteredProducts.length} productos con códigos de barras
                  </span>
                </div>
                
                {/* Buscador */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, SKU o código de barras..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-neutral-600">Cargando productos...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600">
                      {searchTerm ? 'No se encontraron productos' : 'No hay productos con códigos de barras'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedProducts.some(p => p.id === product.id)
                      return (
                        <div
                          key={product.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            isSelected 
                              ? 'border-primary-200 bg-primary-50' 
                              : 'border-neutral-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Imagen del producto */}
                              <div className="flex-shrink-0">
                                <img
                                src={product.image || '/img/placeholder.svg'}
                                alt={product.name}
                                className="w-32 h-32 object-cover rounded-lg border border-neutral-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/img/placeholder.svg';
                                }}
                              />
                              </div>
                              
                              {/* Información del producto */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-neutral-700 truncate">{product.name}</h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                                  <span>SKU: {product.sku || 'N/A'}</span>
                                  <span>Código: {product.ean13 || product.barcode}</span>
                                  <span className="font-semibold text-primary-600">${product.price.toFixed(2)}</span>
                                </div>
                                {product.category && (
                                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded">
                                    {product.category.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => addProduct(product)}
                              className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-700'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-4 w-4 inline mr-1" />
                                  Agregado
                                </>
                              ) : (
                                'Agregar'
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Productos seleccionados */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 sticky top-6">
              <div className="p-4 sm:p-6 border-b border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-700">Productos Seleccionados</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {totalLabels} etiquetas en total
                </p>
              </div>
              
              <div className="p-4 sm:p-6">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <QrCode className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-neutral-600 text-sm">No hay productos seleccionados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="p-3 border border-neutral-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Imagen del producto */}
                            <div className="flex-shrink-0">
                              <img
                                src={product.image || '/img/placeholder.svg'}
                                alt={product.name}
                                className="w-24 h-24 object-cover rounded-lg border border-neutral-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/img/placeholder.svg';
                                }}
                              />
                            </div>
                            
                            {/* Información del producto */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-neutral-700 text-sm truncate">{product.name}</h4>
                              <p className="text-xs text-neutral-500 mt-1">
                                ${product.price.toFixed(2)} • {product.ean13 || product.barcode}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="ml-2 text-neutral-400 hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-neutral-600">Cantidad:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(product.id, product.quantity - 1)}
                              className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{product.quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, product.quantity + 1)}
                              className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Separador */}
                {selectedProducts.length > 0 && (
                  <div className="border-t border-neutral-200 my-4"></div>
                )}
                
                {/* Componente TSPL Printer */}
                <TSPLPrinter 
                  selectedProducts={selectedProducts.map(product => ({
                    ...product,
                    nombre: product.name,
                    codigo_barras: product.barcode || product.ean13 || '',
                    precio_venta: product.price
                  }))}
                  onPrintSuccess={() => {
                    toast.success('Etiquetas TSPL impresas correctamente')
                  }}
                  onPrintError={(error) => {
                    toast.error(`Error TSPL: ${error}`)
                  }}
                  className="mt-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}