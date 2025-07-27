'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, 
  Search, 
  ShoppingCart, 
  Barcode,
  Trash2, 
  Plus,
  Minus,
  Save,
  ArrowLeft,
  QrCode,
  Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

// Importar el escáner de códigos de barras de forma dinámica (solo en el cliente)
const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), {
  ssr: false
})

export default function VentaFisicaPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cartItems, setCartItems] = useState<any[]>([])
  const [barcodeInput, setBarcodeInput] = useState('')
  const [processingOrder, setProcessingOrder] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  
  // Cargar productos
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/productos?admin=true')
      const data = await response.json()
      if (Array.isArray(data)) {
        setProducts(data)
      } else if (Array.isArray(data.products)) {
        setProducts(data.products)
      } else {
        setProducts([])
      }
    } catch (error) {
      toast.error('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.slug && product.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Agregar producto al carrito
  const addToCart = (product: any) => {
    // Verificar si hay stock disponible
    if (product.stock <= 0) {
      toast.error(`${product.name} no tiene stock disponible`)
      return
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = cartItems.find(item => item.id === product.id)
    
    if (existingItem) {
      // Si la cantidad a agregar excede el stock disponible
      if (existingItem.quantity >= product.stock) {
        toast.error(`No hay suficiente stock de ${product.name}`)
        return
      }
      
      // Incrementar cantidad
      const updatedItems = cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      )
      setCartItems(updatedItems)
    } else {
      // Agregar nuevo item
      setCartItems([
        ...cartItems, 
        { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          image: product.images && product.images[0] ? product.images[0] : '/img/placeholder.png',
          quantity: 1,
          stock: product.stock
        }
      ])
    }
    
    toast.success(`${product.name} agregado al carrito`)
  }

  // Buscar producto por código de barras/QR
  const handleBarcodeSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return
    
    try {
      // Primero intentar buscar por código de barras usando la nueva API
      const barcodeResponse = await fetch(`/api/productos/barcode/${barcodeInput.trim()}`)
      
      if (barcodeResponse.ok) {
        const product = await barcodeResponse.json()
        console.log('Producto encontrado por código de barras:', product)
        
        if (product.isAvailable) {
          addToCart(product)
          setBarcodeInput('')
          toast.success(`Producto agregado: ${product.name}`)
        } else {
          toast.error(`Producto encontrado pero sin stock: ${product.name}`)
        }
        return
      }
      
      // Si no se encuentra por código de barras, buscar por ID o slug en la lista local
      const product = products.find(p => 
        p.id === barcodeInput.trim() || 
        p.slug === barcodeInput.trim()
      )
      
      if (product) {
        addToCart(product)
        setBarcodeInput('')
        toast.success(`Producto agregado: ${product.name}`)
      } else {
        toast.error('Producto no encontrado')
      }
    } catch (error) {
      console.error('Error al buscar producto:', error)
      toast.error('Error al buscar el producto')
    }
  }

  // Remover producto del carrito
  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.id !== productId))
    toast.success('Producto eliminado del carrito')
  }

  // Actualizar cantidad de producto en el carrito
  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = cartItems.find(item => item.id === productId)
    
    if (!product) return
    
    // Validar que la cantidad no sea menor a 1 ni mayor al stock disponible
    if (newQuantity < 1) {
      newQuantity = 1
    } else if (newQuantity > product.stock) {
      toast.error(`No hay suficiente stock de ${product.name}`)
      newQuantity = product.stock
    }
    
    const updatedItems = cartItems.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    )
    
    setCartItems(updatedItems)
  }

  // Calcular total del carrito
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Procesar venta física
  const processPhysicalSale = async () => {
    if (cartItems.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    
    setProcessingOrder(true)
    
    try {
      // Crear la venta física
      const response = await fetch('/api/ventas-fisicas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: calculateTotal(),
          subtotal: calculateTotal(),
          tax: 0, // Opcional: calcular impuestos si es necesario
          orderType: 'FISICA' // Usar el nuevo campo orderType para identificar como venta física
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('Venta física registrada correctamente')
        // Limpiar carrito
        setCartItems([])
        // Recargar productos para actualizar stock
        fetchProducts()
      } else {
        throw new Error(result.error || 'Error al procesar la venta')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la venta')
    } finally {
      setProcessingOrder(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/admin" className="btn-secondary text-sm sm:text-base py-1.5 px-2.5 sm:py-2 sm:px-3">
                <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Volver
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-title">Venta Física</h1>
                <p className="text-sm sm:text-base text-body">Registra ventas realizadas en tienda física</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Productos */}
          <div className="md:col-span-1 lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Búsqueda por código de barras/QR */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-700 mb-3 sm:mb-4 flex items-center">
                <Barcode className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary-600" />
                Escanear Código
              </h2>
              <form onSubmit={handleBarcodeSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Escanea o ingresa código de barras/QR"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <QrCode className="absolute right-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                </div>
                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="btn-primary text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4 flex-1 sm:flex-none"
                  >
                    Buscar
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowScanner(true)}
                    className="btn-secondary text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4 flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none"
                  >
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                    Escanear
                  </button>
                </div>
              </form>
              
              {/* Escáner de códigos de barras */}
              {showScanner && (
                <div className="mt-3 sm:mt-4">
                  <BarcodeScanner 
                    onScan={(decodedText) => {
                      setBarcodeInput(decodedText);
                      setShowScanner(false);
                      // Buscar producto automáticamente después de escanear
                      const product = products.find(p => 
                        p.id === decodedText.trim() || 
                        p.slug === decodedText.trim()
                      );
                      
                      if (product) {
                        addToCart(product);
                        setBarcodeInput('');
                        toast.success(`${product.name} agregado al carrito`);
                      } else {
                        toast.error('Producto no encontrado');
                      }
                    }}
                    onClose={() => setShowScanner(false)}
                  />
                </div>
              )}
            </div>
            
            {/* Búsqueda de productos */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-700 mb-3 sm:mb-4 flex items-center">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary-600" />
                Productos
              </h2>
              <div className="relative mb-4 sm:mb-6">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm sm:text-base border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
              </div>
              
              {loading ? (
                <div className="flex justify-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-neutral-500 text-sm sm:text-base">
                  No se encontraron productos
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="border border-neutral-200 rounded-lg p-3 sm:p-4 flex">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-100 rounded-lg overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                        <img 
                          src={product.images && product.images[0] ? product.images[0] : '/img/placeholder.png'} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-800 text-sm sm:text-base truncate">{product.name}</h3>
                        <p className="text-xs sm:text-sm text-neutral-500 mb-1">Stock: {product.stock}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-primary-600 text-sm sm:text-base">${product.price.toFixed(2)}</span>
                          <button 
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                            className={`text-xs px-2 sm:px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                          >
                            {product.stock > 0 ? 'Vender' : 'Sin stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Carrito de venta */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-4 sm:p-6 sticky top-4 sm:top-6">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-700 mb-3 sm:mb-4 flex items-center">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary-600" />
                Carrito de Venta
              </h2>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-neutral-500 text-sm sm:text-base">
                  No hay productos en el carrito
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                  {cartItems.map(item => (
                    <div key={item.id} className="border-b border-neutral-200 pb-3 sm:pb-4 last:border-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-neutral-800 text-xs sm:text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-neutral-500">${item.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-neutral-300 rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-neutral-600 hover:bg-neutral-100"
                          >
                            <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </button>
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-neutral-600 hover:bg-neutral-100"
                          >
                            <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </button>
                        </div>
                        <span className="font-semibold text-primary-600 text-xs sm:text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-t border-neutral-200 pt-3 sm:pt-4">
                <div className="flex justify-between mb-1 sm:mb-2">
                  <span className="text-neutral-600 text-sm">Subtotal</span>
                  <span className="font-medium text-sm sm:text-base">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-3 sm:mb-4">
                  <span className="text-neutral-600 text-sm">Total</span>
                  <span className="font-semibold text-base sm:text-lg">${calculateTotal().toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={processPhysicalSale}
                  disabled={cartItems.length === 0 || processingOrder}
                  className="btn-primary w-full flex items-center justify-center text-sm sm:text-base py-2 sm:py-2.5"
                >
                  {processingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white mr-1.5 sm:mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Registrar Venta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}