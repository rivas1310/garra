'use client'

import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
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
  Camera,
  Printer,
  CreditCard,
  DollarSign,
  X,
  Bluetooth
} from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter'
import TicketModal from '@/components/TicketModal'

// Importar el escáner de códigos de barras de forma dinámica (solo en el cliente)
const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), {
  ssr: false
})

// Importar el escáner externo de forma dinámica (solo en el cliente)
const ExternalScanner = dynamic(() => import('@/components/ExternalScanner'), {
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
  const [showExternalScanner, setShowExternalScanner] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta'>('efectivo')
  const [lastSale, setLastSale] = useState<any>(null)
  const [showBluetoothModal, setShowBluetoothModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [stockFilter, setStockFilter] = useState('all') // 'all', 'in_stock', 'low_stock'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [discountType, setDiscountType] = useState('percentage') // 'percentage', 'fixed'
  const [discountValue, setDiscountValue] = useState('')
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  
  // Hook de impresión Bluetooth
  const {
    isConnected: isPrinterConnected,
    isPrinting,
    error: printerError,
    deviceName,
    connect: connectPrinter,
    disconnect: disconnectPrinter,
    print: printToBluetooth
  } = useBluetoothPrinter()
  
  // Cargar productos
  useEffect(() => {
    fetchProducts()
  }, [])

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevenir atajos si hay un modal abierto o se está escribiendo en un input
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA'
      
      if (isInputFocused && !['F1', 'F2', 'F3', 'F4', 'F5', 'Escape'].includes(event.key)) {
        return
      }

      switch (event.key) {
        case 'F1':
          event.preventDefault()
          // Enfocar en el campo de búsqueda
          const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
            searchInput.select()
          }
          toast.success('F1: Campo de búsqueda enfocado')
          break

        case 'F2':
          event.preventDefault()
          // Procesar pago si hay productos en el carrito
          if (cartItems.length > 0 && !showPaymentModal) {
            setShowPaymentModal(true)
            toast.success('F2: Modal de pago abierto')
          } else if (cartItems.length === 0) {
            toast.error('F2: Agrega productos al carrito primero')
          }
          break

        case 'F3':
          event.preventDefault()
          // Limpiar carrito
          if (cartItems.length > 0) {
            setCartItems([])
            toast.success('F3: Carrito limpiado')
          } else {
            toast.error('F3: El carrito ya está vacío')
          }
          break

        case 'F4':
          event.preventDefault()
          // Abrir escáner de código de barras
          if (!showScanner) {
            setShowScanner(true)
            toast.success('F4: Escáner de código de barras abierto')
          }
          break

        case 'F5':
          event.preventDefault()
          // Mostrar/ocultar ayuda de atajos
          setShowKeyboardHelp(!showKeyboardHelp)
          break

        case 'Escape':
          event.preventDefault()
          // Cerrar modales abiertos
          if (showPaymentModal) {
            setShowPaymentModal(false)
            toast.success('Modal de pago cerrado')
          } else if (showScanner) {
            setShowScanner(false)
            toast.success('Escáner cerrado')
          } else if (showKeyboardHelp) {
            setShowKeyboardHelp(false)
          } else if (showBluetoothModal) {
            setShowBluetoothModal(false)
          } else if (showTicketModal) {
            setShowTicketModal(false)
          }
          break

        case '+':
        case '=':
          if (event.ctrlKey) {
            event.preventDefault()
            // Agregar último producto buscado al carrito
            toast('Ctrl + +: Función no implementada aún')
          }
          break

        case '-':
          if (event.ctrlKey) {
            event.preventDefault()
            // Remover último producto del carrito
            if (cartItems.length > 0) {
              const newCartItems = [...cartItems]
              newCartItems.pop()
              setCartItems(newCartItems)
              toast.success('Ctrl + -: Último producto removido')
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [cartItems, showPaymentModal, showScanner, showKeyboardHelp, showBluetoothModal, showTicketModal])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Para admin, cargar más productos (hasta 1000 para venta física)
      const response = await fetch(`/api/productos?admin=true&limit=1000&t=${Date.now()}`)
      const data = await response.json()
      log.error('Datos recibidos en venta física:', data);
      if (Array.isArray(data.productos)) {
        setProducts(data.productos)
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

  // Filtrar productos por búsqueda y filtros avanzados
  const filteredProducts = products.filter(product => {
    // Filtro de búsqueda por texto
    const matchesSearch = searchTerm === '' || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.slug && product.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filtro por categoría
    const matchesCategory = categoryFilter === '' || 
      (product.category && product.category.toLowerCase().includes(categoryFilter.toLowerCase()))
    
    // Filtro por rango de precio
    const matchesPrice = (
      (priceRange.min === '' || product.price >= parseFloat(priceRange.min)) &&
      (priceRange.max === '' || product.price <= parseFloat(priceRange.max))
    )
    
    // Filtro por stock
    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && (product.totalStock || product.stock) > 0) ||
      (stockFilter === 'low_stock' && (product.totalStock || product.stock) > 0 && (product.totalStock || product.stock) <= 5)
    
    return matchesSearch && matchesCategory && matchesPrice && matchesStock
  })

  // Agregar producto al carrito
  const addToCart = (product: any, variant?: any) => {
    // Si el producto tiene variantes y no se especificó una variante
    if (product.variants && product.variants.length > 0 && !variant) {
      // Si solo hay una variante, agregarla automáticamente
      if (product.variants.length === 1) {
        addToCart(product, product.variants[0])
        return
      }
      // Si hay múltiples variantes, abrir modal de selección
      setSelectedProduct(product)
      setShowVariantModal(true)
      return
    }

    // Usar el stock de la variante si existe, sino el stock del producto
    const availableStock = variant ? variant.stock : product.stock
    const productPrice = variant ? (variant.price || product.price) : product.price
    
    // Verificar si hay stock disponible
    if (availableStock <= 0) {
      toast.error(`${product.name} no tiene stock disponible`)
      return
    }

    // Crear una clave única para el item del carrito (incluye variante si existe)
    const cartKey = variant ? `${product.id}-${variant.id}` : product.id
    
    // Verificar si el producto (con esta variante específica) ya está en el carrito
    const existingItem = cartItems.find(item => {
      if (variant) {
        return item.id === product.id && item.variantId === variant.id
      }
      return item.id === product.id && !item.variantId
    })
    
    if (existingItem) {
      // Si la cantidad a agregar excede el stock disponible
      if (existingItem.quantity >= availableStock) {
        const variantInfo = variant ? ` (${variant.color || ''} ${variant.size || ''})`.trim() : ''
        toast.error(`No hay suficiente stock de ${product.name}${variantInfo}`)
        return
      }
      
      // Incrementar cantidad
      const updatedItems = cartItems.map(item => {
        if (variant) {
          return item.id === product.id && item.variantId === variant.id
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        }
        return item.id === product.id && !item.variantId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      })
      setCartItems(updatedItems)
    } else {
      // Agregar nuevo item
      const newItem = { 
          id: product.id, 
          name: product.name, 
        price: productPrice, 
          image: product.images && product.images[0] ? product.images[0] : '/img/placeholder.png',
          quantity: 1,
        stock: availableStock,
        ...(variant && {
          variantId: variant.id,
          variantInfo: {
            color: variant.color,
            size: variant.size
          }
        })
      }
      setCartItems([...cartItems, newItem])
    }
    
    const variantInfo = variant ? ` (${variant.color || ''} ${variant.size || ''})`.trim() : ''
    toast.success(`${product.name}${variantInfo} agregado al carrito`)
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
        log.error('Producto encontrado por código de barras:', product)
        
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
      log.error('Error al buscar producto:', error)
      toast.error('Error al buscar el producto')
    }
  }

  // Remover producto del carrito
  const removeFromCart = (cartKey: string) => {
    setCartItems(cartItems.filter(item => item.cartKey !== cartKey))
    toast.success('Producto eliminado del carrito')
  }

  // Actualizar cantidad de producto en el carrito
  const updateQuantity = (cartKey: string, newQuantity: number) => {
    const product = cartItems.find(item => item.cartKey === cartKey)
    
    if (!product) return
    
    // Validar que la cantidad no sea menor a 1 ni mayor al stock disponible
    if (newQuantity < 1) {
      newQuantity = 1
    } else if (newQuantity > product.stock) {
      toast.error(`No hay suficiente stock de ${product.name}`)
      newQuantity = product.stock
    }
    
    const updatedItems = cartItems.map(item => 
      item.cartKey === cartKey 
        ? { ...item, quantity: newQuantity } 
        : item
    )
    
    setCartItems(updatedItems)
  }

  // Aplicar descuento al carrito
  const applyDiscount = () => {
    if (!discountValue || parseFloat(discountValue) <= 0) {
      toast.error('Ingresa un valor de descuento válido')
      return
    }

    const currentTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    let discountAmount = 0

    if (discountType === 'percentage') {
      const percentage = parseFloat(discountValue)
      if (percentage > 100) {
        toast.error('El descuento no puede ser mayor al 100%')
        return
      }
      discountAmount = (currentTotal * percentage) / 100
    } else {
      discountAmount = parseFloat(discountValue)
      if (discountAmount > currentTotal) {
        toast.error('El descuento no puede ser mayor al total')
        return
      }
    }

    // Aplicar descuento proporcionalmente a cada producto
    const discountRatio = discountAmount / currentTotal
    const updatedItems = cartItems.map(item => ({
      ...item,
      discountedPrice: item.price * (1 - discountRatio)
    }))

    setCartItems(updatedItems)
    setShowDiscountModal(false)
    setDiscountValue('')
    toast.success(`Descuento de $${discountAmount.toFixed(2)} aplicado`)
  }

  // Limpiar carrito
  const clearCart = () => {
    if (cartItems.length === 0) {
      toast.error('El carrito ya está vacío')
      return
    }
    setCartItems([])
    toast.success('Carrito limpiado')
  }

  // Guardar carrito para más tarde
  const saveCart = () => {
    if (cartItems.length === 0) {
      toast.error('No hay productos en el carrito para guardar')
      return
    }
    localStorage.setItem('savedCart', JSON.stringify(cartItems))
    toast.success('Carrito guardado exitosamente')
  }

  // Cargar carrito guardado
  const loadSavedCart = () => {
    const savedCart = localStorage.getItem('savedCart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
      localStorage.removeItem('savedCart')
      toast.success('Carrito cargado exitosamente')
    } else {
      toast.error('No hay carrito guardado')
    }
  }

  // Calcular total del carrito
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountedPrice || item.price
      return total + (price * item.quantity)
    }, 0)
  }

  // Calcular subtotal sin descuentos
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Calcular descuento total aplicado
  const calculateTotalDiscount = () => {
    return calculateSubtotal() - calculateTotal()
  }

  // Abrir modal de confirmación de venta
  const openPaymentModal = () => {
    log.error('🔍 Abriendo modal de pago...')
    log.error('📦 Items en carrito:', cartItems.length)
    
    if (cartItems.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    
    log.error('✅ Modal abierto, showPaymentModal:', true)
    setShowPaymentModal(true)
  }

  // Procesar venta física
  const processPhysicalSale = async () => {
    log.error('🚀 Procesando venta física...')
    log.error('💳 Método de pago seleccionado:', paymentMethod)
    
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
            price: item.price,
            // Incluir información de la variante si existe
            ...(item.variantId && {
              variantId: item.variantId,
              variantInfo: item.variantInfo
            })
          })),
          total: calculateTotal(),
          subtotal: calculateTotal(),
          tax: 0,
          orderType: 'FISICA',
          paymentMethod: paymentMethod
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setLastSale(result)
        toast.success('Venta física registrada correctamente')
        // Limpiar carrito
        setCartItems([])
        // Recargar productos para actualizar stock
        fetchProducts()
        // Cerrar modal
        setShowPaymentModal(false)
        
        // Imprimir ticket automáticamente después de confirmar la venta
        // log.error('🖨️ Imprimiendo ticket automáticamente...')
        //setTimeout(() => {
          // Usar los datos de la venta recién creada para imprimir
         // printTicketWithData(result)
       // }, 1000) // Esperar 1 segundo para que se procese la venta
      } else {
        throw new Error(result.error || 'Error al procesar la venta')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la venta')
    } finally {
      setProcessingOrder(false)
    }
  }

  // Imprimir ticket
    const printTicket = () => {
    log.error('🖨️ Iniciando impresión del ticket...')
    log.error('📋 Datos de la venta:', lastSale)
    
    if (!lastSale) {
      toast.error('No hay datos de venta para imprimir')
      return
    }
    
    try {
      const printWindow = window.open('', '_blank', 'width=200,height=600')
      if (!printWindow) {
        toast.error('No se pudo abrir la ventana de impresión. Verifica que el bloqueador de popups esté desactivado.')
        return
      }

      // Calcular valores para el ticket estructurado
      const subtotal = lastSale.subtotal || lastSale.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
      const total = lastSale.total || subtotal
      const tax = subtotal * 0.16
      const realSubtotal = total - tax

      // HTML simplificado para RawBT - solo tablas básicas
      const ticketContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket - Garras Felinas</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: 48mm auto;
              margin: 0;
            }
            body { 
              font-family: monospace; 
              font-size: 10px; 
              margin: 0; 
              padding: 5px;
              width: 48mm;
              max-width: 48mm;
              background: white;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 10px;
            }
            td {
              padding: 2px 1px;
              vertical-align: top;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dotted #000; margin: 3px 0; }
            .small { font-size: 8px; }
            @media print {
              body { 
                margin: 0; 
                padding: 0;
                width: 48mm;
              }
              table {
                width: 48mm;
              }
            }
          </style>
        </head>
        <body>
          <table>
            <tr><td class="center bold" colspan="2"><img src="/logos/diseno-sin-titulo-5.png" width="150" height="150" alt="Logo" /></td></tr>
            <tr><td class="center small" colspan="2">Venta Física</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            <tr><td class="center small" colspan="2">andador 20 de noviembre, Zapopan</td></tr>
            <tr><td class="center small" colspan="2">Tel: +52 (555) 123-4567</td></tr>
            <tr><td class="center small" colspan="2">info@garrasfelinas.com</td></tr>
            <tr><td class="center small" colspan="2">RFC: GAR-123456-ABC</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            <tr><td class="small">Fecha:</td><td class="right small">${new Date().toLocaleString('es-MX')}</td></tr>
            <tr><td class="small">Ticket #:</td><td class="right small">${lastSale.id}</td></tr>
            <tr><td class="small">Cajero:</td><td class="right small">Admin</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            ${lastSale.items.map((item: any, index: number) => `
              <tr><td colspan="2" class="small">${item.product?.name || 'Producto'} x${item.quantity}</td></tr>
              <tr><td class="small">SKU: ${item.product?.sku || 'N/A'}</td><td class="right small">$${(item.price * item.quantity).toFixed(2)}</td></tr>
              <tr><td class="small">$${item.price.toFixed(2)} c/u</td><td></td></tr>
            `).join('')}
            
            <tr><td class="divider" colspan="2"></td></tr>
            <tr><td class="small">Subtotal:</td><td class="right small">$${realSubtotal.toFixed(2)}</td></tr>
            <tr><td class="small">IVA (16%):</td><td class="right small">$${tax.toFixed(2)}</td></tr>
            <tr><td class="bold">TOTAL:</td><td class="right bold">$${total.toFixed(2)}</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            <tr><td colspan="2" class="small">Método: ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</td></tr>
            <tr><td class="center small" colspan="2">Comprobante fiscal</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            <tr><td class="center bold" colspan="2">¡Gracias por su compra!</td></tr>
            <tr><td class="center small" colspan="2">www.garrasfelinas.com</td></tr>
            <tr><td class="center small" colspan="2">Conserve este ticket</td></tr>
          </table>
        </body>
        </html>
      `

      log.error('📄 Contenido del ticket generado')
      printWindow.document.write(ticketContent)
      printWindow.document.close()
      
      // Imprimir automáticamente después de un breve delay
      setTimeout(() => {
        try {
          printWindow.print()
          setTimeout(() => {
            printWindow.close()
            toast.success('Ticket enviado a impresión')
          }, 1000)
        } catch (error) {
          log.error('Error al imprimir:', error)
          // Si falla, mantener la ventana abierta para impresión manual
        }
      }, 500)
      
    } catch (error) {
      log.error('❌ Error al imprimir:', error)
      toast.error('Error al generar el ticket de impresión')
    }
  }

  // Función para imprimir ticket con datos específicos
  const printTicketWithData = (saleData: any) => {
    log.error('🖨️ Imprimiendo ticket mejorado...')
    log.error('📋 Datos de la venta:', saleData)
    
    if (!saleData) {
      toast.error('No hay datos de venta para imprimir')
      return
    }
    
    try {
      const printWindow = window.open('', '_blank', 'width=600,height=800')
      if (!printWindow) {
        toast.error('No se pudo abrir la ventana de impresión. Verifica que el bloqueador de popups esté desactivado.')
        return
      }

      // Calcular valores para el ticket estructurado
      const subtotal = saleData.subtotal || saleData.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
      const total = saleData.total || subtotal
      const tax = subtotal * 0.16
      const realSubtotal = total - tax

      // Información de la empresa
      const companyInfo = {
        name: 'Garras Felinas',
        logo: '/logos/diseno-sin-titulo-5.png',
        address: 'andador 20 de noviembre, Zapopan',
        phone: '+52 (555) 123-4567',
        email: 'info@garrasfelinas.com',
        website: 'www.garrasfelinas.com',
        rfc: 'GAR-123456-ABC'
      }

      const ticketContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket de Venta - ${companyInfo.name}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', 'Monaco', 'Menlo', monospace; 
              font-size: 14px; 
              line-height: 1.4;
              margin: 0; 
              padding: 4px; 
              background: white;
              color: black;
              width: 58mm;
              max-width: 58mm;
              font-weight: bold;
            }
            .header { 
              text-align: center; 
              margin-bottom: 8px; 
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
            }
            .logo {
              max-width: 50mm;
              height: auto;
              margin-bottom: 2px;
            }
            .title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 2px; 
              text-transform: uppercase;
            }
            .subtitle { 
              font-size: 12px; 
              margin-bottom: 1px;
              font-weight: bold;
            }
            .company-info {
              font-size: 10px;
              margin: 3px 0;
              line-height: 1.2;
              font-weight: bold;
            }
            .divider { 
              border-top: 1px dashed #000; 
              margin: 4px 0; 
            }
            .item { 
              margin: 2px 0; 
              font-size: 12px;
              word-wrap: break-word;
              font-weight: bold;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .item-details {
              font-size: 10px;
              color: #333;
              margin-top: 1px;
              word-wrap: break-word;
              font-weight: bold;
            }
            .item-name { 
              flex: 1; 
              text-align: left;
              padding-right: 4px;
              word-wrap: break-word;
              font-weight: bold;
            }
            .item-price { 
              text-align: right; 
              font-weight: bold;
              white-space: nowrap;
            }
            .total { 
              font-weight: bold; 
              border-top: 1px solid #000; 
              padding-top: 4px; 
              margin-top: 4px; 
              font-size: 13px;
            }
            .footer { 
              text-align: center; 
              margin-top: 8px; 
              font-size: 10px; 
              border-top: 1px dashed #000;
              padding-top: 4px;
              font-weight: bold;
            }
            .payment-method {
              font-size: 11px;
              margin-top: 2px;
              text-align: center;
              font-weight: bold;
            }
            .tax-info {
              font-size: 9px;
              margin-top: 2px;
              text-align: center;
              font-weight: bold;
            }
            @media print { 
              body { 
                margin: 0; 
                padding: 2px; 
                width: 58mm;
                max-width: 58mm;
              }
              .no-print { display: none; }
              @page {
                size: 58mm auto;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <table>
            <tr><td class="center bold" colspan="2"><img src="/logos/diseno-sin-titulo-5.png" width="150" height="150" alt="Logo" /></td></tr>
            <tr><td class="center small" colspan="2">Venta Física</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            <tr><td class="center small" colspan="2">andador 20 de noviembre, Zapopan</td></tr>
            <tr><td class="center small" colspan="2">Tel: +52 (555) 123-4567</td></tr>
            <tr><td class="center small" colspan="2">info@garrasfelinas.com</td></tr>
            <tr><td class="center small" colspan="2">RFC: GAR-123456-ABC</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            <tr><td class="small">Fecha:</td><td class="right small">${new Date().toLocaleString('es-MX')}</td></tr>
            <tr><td class="small">Ticket #:</td><td class="right small">${lastSale.id}</td></tr>
            <tr><td class="small">Cajero:</td><td class="right small">Admin</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            ${lastSale.items.map((item: any, index: number) => `
              <tr><td colspan="2" class="small">${item.product?.name || 'Producto'} x${item.quantity}</td></tr>
              <tr><td class="small">SKU: ${item.product?.sku || 'N/A'}</td><td class="right small">$${(item.price * item.quantity).toFixed(2)}</td></tr>
              <tr><td class="small">$${item.price.toFixed(2)} c/u</td><td></td></tr>
            `).join('')}
            
            <tr><td class="divider" colspan="2"></td></tr>
            <tr><td class="small">Subtotal:</td><td class="right small">$${realSubtotal.toFixed(2)}</td></tr>
            <tr><td class="small">IVA (16%):</td><td class="right small">$${tax.toFixed(2)}</td></tr>
            <tr><td class="bold">TOTAL:</td><td class="right bold">$${total.toFixed(2)}</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            <tr><td colspan="2" class="small">Método: ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</td></tr>
            <tr><td class="center small" colspan="2">Comprobante fiscal</td></tr>
            <tr><td class="divider" colspan="2"></td></tr>
            
            <tr><td class="center bold" colspan="2">¡Gracias por su compra!</td></tr>
            <tr><td class="center small" colspan="2">www.garrasfelinas.com</td></tr>
            <tr><td class="center small" colspan="2">Conserve este ticket</td></tr>
          </table>
        </body>
        </html>
      `

      log.error('📄 Contenido del ticket mejorado generado')
      printWindow.document.write(ticketContent)
      printWindow.document.close()
      
      // Esperar a que se cargue el contenido antes de imprimir
      printWindow.onload = () => {
        log.error('✅ Ventana de impresión cargada')
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
          log.error('🖨️ Comando de impresión enviado')
          
          // Cerrar la ventana después de un tiempo
          setTimeout(() => {
            printWindow.close()
            log.error('✅ Ventana de impresión cerrada')
            toast.success('Ticket mejorado enviado a impresión')
          }, 2000)
        }, 1000)
      }
      
    } catch (error) {
      log.error('❌ Error al imprimir:', error)
      toast.error('Error al generar el ticket de impresión')
    }
  }

  // Función alternativa de impresión (fallback) - HTML simple para RawBT
  const printTicketAlternative = () => {
    log.error('🖨️ Generando ticket simple para RawBT... v8.0')
    log.error('📊 Datos de venta:', lastSale)
    
    if (!lastSale) {
      toast.error('No hay datos de venta para mostrar')
      return
    }

    // Calcular valores
    const subtotal = lastSale.subtotal || lastSale.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
    const total = lastSale.total || subtotal
    const tax = subtotal * 0.16
    const realSubtotal = total - tax

    // Generar HTML simple optimizado para 48mm
    const ticketHTML = `
      <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket de Venta - Garras Felinas</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', 'Monaco', 'Menlo', monospace; 
              font-size: 12px; 
              font-weight: bold;
              line-height: 1.3;
              margin: 0; 
              padding: 4px; 
              background: white;
              color: black;
              width: 58mm;
              max-width: 58mm;
            }
            .header { 
              text-align: center; 
              margin-bottom: 6px; 
              border-bottom: 2px solid #000;
              padding-bottom: 4px;
            }
            .logo {
              font-size: 16px;
              margin-bottom: 2px;
            }
            .title { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 2px; 
              text-transform: uppercase;
            }
            .subtitle { 
              font-size: 10px; 
              margin-bottom: 1px;
              font-weight: bold;
            }
            .business-info {
              text-align: center;
              margin-bottom: 6px;
              font-size: 9px;
              font-weight: bold;
              color: #333;
            }
            .divider { 
              border-top: 1px dotted #000; 
              margin: 3px 0; 
            }
            .section-title {
              font-size: 11px;
              font-weight: bold;
              margin: 4px 0 2px 0;
              text-align: center;
            }
            .transaction-info {
              font-size: 10px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .transaction-row {
              display: flex;
              justify-content: space-between;
              margin: 1px 0;
            }
            .product-item {
              margin-bottom: 3px;
            }
            .product-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 1px;
              font-weight: bold;
            }
            .product-details {
              font-size: 9px;
              font-weight: bold;
              color: #666;
              margin-left: 4px;
              margin-bottom: 2px;
            }
            .totals-section {
              margin-top: 4px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 1px 0;
              font-size: 11px;
              font-weight: bold;
            }
            .total-final {
              font-weight: bold;
              font-size: 12px;
              border-top: 1px solid #000;
              padding-top: 2px;
              margin-top: 2px;
            }
            .payment-info {
              text-align: center;
              margin: 4px 0;
              font-size: 10px;
              font-weight: bold;
            }
            .footer { 
              text-align: center; 
              margin-top: 6px; 
              font-size: 9px; 
              font-weight: bold;
              border-top: 1px dotted #000;
              padding-top: 4px;
            }
            .footer-title {
              font-weight: bold;
              font-size: 10px;
              margin-bottom: 2px;
            }
            @media print { 
              body { 
                margin: 0; 
                padding: 2px; 
                width: 58mm;
                max-width: 58mm;
              }
              .no-print { display: none; }
              @page {
                size: 58mm auto;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <!-- Header con Logo -->
          <div class="header">
            <div class="logo"><img src="/logos/diseno-sin-titulo-5.png" width="180" height="180" alt="Logo" /></div>
            <div class="title">Garras Felinas</div>
            <div class="subtitle">GARRAS FELINAS</div>
            <div class="subtitle">Venta Física</div>
          </div>
          
          <!-- Información del Negocio -->
          <div class="business-info">
            <div>andador 20 de noviembre, Zapopan</div>
            <div>Tel: +52 (555) 123-4567</div>
            <div>info@garrasfelinas.com</div>
            <div>RFC: GAR-123456-ABC</div>
          </div>
          
          <div class="divider"></div>
          
          <!-- Información de la Transacción -->
          <div class="section-title">DETALLES DE LA TRANSACCIÓN</div>
          <div class="transaction-info">
            <div class="transaction-row">
              <span>Fecha:</span>
              <span>${new Date().toLocaleString('es-MX', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div class="transaction-row">
              <span>Ticket #:</span>
              <span>${lastSale.id}</span>
            </div>
            <div class="transaction-row">
              <span>Cajero:</span>
              <span>Admin</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <!-- Productos -->
          <div class="section-title">PRODUCTOS</div>
          ${lastSale.items.map((item: any) => `
            <div class="product-item">
              <div class="product-header">
                <span>${item.product?.name || 'Producto'} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <div class="product-details">
                SKU: ${item.product?.sku || 'N/A'} | $${item.price.toFixed(2)} c/u
              </div>
            </div>
          `).join('')}
          
          <div class="divider"></div>
          
          <!-- Totales -->
          <div class="section-title">RESUMEN FINANCIERO</div>
          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${realSubtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>IVA (16%):</span>
              <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="total-row total-final">
              <span>TOTAL:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <!-- Información de Pago -->
          <div class="payment-info">
            <div><strong>Método de pago:</strong> ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</div>
                          <div style="font-size: 8px; margin-top: 2px;">Este documento es un comprobante fiscal</div>
          </div>
          
          <div class="divider"></div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-title">¡Gracias por su compra!</div>
            <div>www.garrasfelinas.com</div>
                          <div style="margin-top: 4px; font-size: 8px;">
                Conserve este ticket para garantías y devoluciones
              </div>
          </div>
          
          <script>
            // Auto-print cuando se carga la página
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
            };
          </script>
        </body>
        </html>
      `
    

    // Crear una nueva ventana con el contenido simple
    const printWindow = window.open('', '_blank', 'width=200,height=600')
    if (printWindow) {
      printWindow.document.write(ticketHTML)
      printWindow.document.close()
      
      // Imprimir automáticamente después de un breve delay
      setTimeout(() => {
        try {
          printWindow.print()
          setTimeout(() => {
            printWindow.close()
          }, 1000)
        } catch (error) {
          log.error('Error al imprimir:', error)
          // Si falla, mantener la ventana abierta para impresión manual
        }
      }, 500)
    } else {
      // Fallback: mostrar en modal si no se puede abrir ventana
      log.error('✅ Abriendo modal del ticket...')
      setShowTicketModal(true)
    }
  }

  // Imprimir ticket con Bluetooth
  const printTicketBluetooth = async (saleData: any) => {
    if (!isPrinterConnected) {
      toast.error('No hay conexión con la impresora Bluetooth')
      setShowBluetoothModal(true)
      return
    }

    if (!saleData) {
      toast.error('No hay datos de venta para imprimir')
      return
    }

    try {
      const ticketContent = generateBluetoothTicketContent(saleData)
      await printToBluetooth(ticketContent)
      toast.success('Ticket impreso exitosamente')
    } catch (error) {
      log.error('Error de impresión Bluetooth:', error)
      toast.error(error instanceof Error ? error.message : 'Error al imprimir el ticket')
    }
  }

  // Generar contenido del ticket para Bluetooth
  const generateBluetoothTicketContent = (sale: any) => {
    // Verificar que sale no sea null
    if (!sale) {
      throw new Error('No hay datos de venta para generar el ticket')
    }

    // Calcular subtotal si no existe
    const subtotal = sale.subtotal || sale.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
    const total = sale.total || subtotal
    const tax = subtotal * 0.16
    const realSubtotal = total - tax

    // Formatear productos con detalles
    const items = sale.items?.map((item: any) => {
      const productName = item.product?.name || 'Producto'
      const quantity = item.quantity || 1
      const unitPrice = item.price || 0
      const totalPrice = unitPrice * quantity
      const sku = item.product?.barcode || item.product?.sku || 'N/A'
      
      return `${productName} x${quantity}\n  SKU: ${sku} | $${unitPrice.toFixed(2)} c/u\n  Total: $${totalPrice.toFixed(2)}`
    }).join('\n\n') || ''

    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString('es-MX')
    const formattedTime = currentDate.toLocaleTimeString('es-MX')

    return `
 /\\_/\\ GARRAS FELINAS  /\\_/\\
 ( o.o )               ( o.o )
 > ^ <                 > ^ <
      Vístete con causa     
    Vístete con conciencia
================================
    Venta Fisica
andador 20 de noviembre, Zapopan
  Tel: +52 33 5193 5392
 info@garrasfelinas.com
   RFC: GAR-123456-ABC

================================
Fecha: ${formattedDate}, ${formattedTime}
Ticket #: ${sale.id || 'N/A'}
Cajero: ${sale.vendedor || 'Admin'}

================================
${items}

================================
Subtotal:                $${realSubtotal.toFixed(2)}
IVA (16%):               $${tax.toFixed(2)}
TOTAL:                   $${total.toFixed(2)}

================================
Metodo de pago: ${sale.paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}
${sale.paymentMethod === 'tarjeta' ? 'Ultimos 4 digitos: ****1234' : ''}

================================
Gracias por tu compra!
 /\\_/\\ GARRAS FELINAS  /\\_/\\
 ( ^.^ )               ( ^.^ )
 > ^ <                 > ^ <
================================
        Visita 
www.garrasfelinas.com
Conserve este ticket para
garantias y devoluciones

    `
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header simple y funcional */}
      <div className="bg-white shadow-md border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium">
                ← Volver
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">🏪 Punto de Venta</h1>
                <p className="text-gray-600">Garras Felinas - Venta en Tienda</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Botón de ayuda de atajos */}
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 rounded-lg font-medium transition-colors flex items-center gap-2"
                title="Atajos de teclado (F5)"
              >
                ⌨️ Atajos
              </button>
              
              {/* Estado Bluetooth simple */}
              <button
                onClick={() => setShowBluetoothModal(true)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isPrinterConnected 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {isPrinterConnected ? '🖨️ Conectado' : '❌ Sin Impresora'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 lg:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Panel izquierdo - Carrito de venta (2 columnas) */}
          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            {/* Header del carrito con total mejorado */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
              {/* Header sticky */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Carrito de Venta</h2>
                      <p className="text-blue-100 text-sm">{cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium">Total a cobrar</p>
                    <p className="text-3xl font-bold text-white">${calculateTotal().toFixed(2)}</p>
                    <p className="text-blue-100 text-xs">MXN</p>
                  </div>
                </div>
              </div>
              
              {/* Contenido del carrito mejorado */}
              <div className="p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Carrito vacío</h3>
                    <p className="text-gray-500 text-sm">Agrega productos para comenzar la venta</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {cartItems.map(item => (
                      <div key={item.cartKey} className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-all duration-200">
                        <div className="flex items-center gap-4">
                          {/* Imagen del producto */}
                          <div className="relative flex-shrink-0">
                            <div className="w-32 sm:w-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-200 transition-all duration-200">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          </div>
                          
                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">{item.name}</h3>
                            {/* Mostrar información de variante si existe */}
                            {item.variantInfo && (
                              <div className="flex gap-2 mb-1">
                                {item.variantInfo.color && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Color: {item.variantInfo.color}
                                  </span>
                                )}
                                {item.variantInfo.size && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Talla: {item.variantInfo.size}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-gray-500 text-xs mb-2">${item.price.toFixed(2)} c/u</p>
                            
                            {/* Controles de cantidad */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                                <button 
                                  onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                                  className="p-2 text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors rounded-l-lg"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-bold text-gray-800 min-w-[3rem] text-center bg-gray-50">
                                  {item.quantity}
                                </span>
                                <button 
                                  onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                                  className="p-2 text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors rounded-r-lg"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              
                              {/* Total del item */}
                              <div className="text-right flex-1">
                                <p className="font-bold text-lg text-blue-600">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botón eliminar */}
                          <button 
                            onClick={() => removeFromCart(item.cartKey)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Resumen y botón de cobrar */}
                {cartItems.length > 0 && (
                  <div className="border-t-2 border-gray-200 pt-4 space-y-4">
                    {/* Resumen de totales */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} productos):</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>IVA (16%):</span>
                        <span>${(calculateTotal() * 0.16).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2">
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total:</span>
                          <span className="text-green-600">${(calculateTotal() * 1.16).toFixed(2)} MXN</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Acciones rápidas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <button 
                        onClick={clearCart}
                        className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Limpiar
                      </button>
                      <button 
                        onClick={saveCart}
                        className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Guardar
                      </button>
                    </div>
                    
                    {/* Acciones adicionales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                      <button 
                        onClick={() => setShowDiscountModal(true)}
                        className="py-2 px-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span className="hidden sm:inline">Descuento</span>
                        <span className="sm:hidden">%</span>
                      </button>
                      <button 
                        onClick={loadSavedCart}
                        className="py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">Cargar</span>
                        <span className="sm:hidden">📦</span>
                      </button>
                      <button 
                        onClick={() => setShowQuickActions(!showQuickActions)}
                        className="py-2 px-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 sm:col-span-2 lg:col-span-1"
                      >
                        <span>⚡</span>
                        <span className="hidden sm:inline">Más Acciones</span>
                        <span className="sm:hidden">Más</span>
                      </button>
                    </div>
                    
                    {/* Panel de acciones rápidas expandido */}
                    {showQuickActions && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">⚡ Acciones Rápidas</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => {
                              toast('Función de cambio en desarrollo')
                            }}
                            className="py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors"
                          >
                            🔄 Cambio
                          </button>
                          <button 
                            onClick={() => {
                              toast('Función de devolución en desarrollo')
                            }}
                            className="py-2 px-3 bg-red-400 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors"
                          >
                            ↩️ Devolución
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Botón de cobrar principal */}
                    <button 
                      onClick={openPaymentModal}
                      className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <CreditCard className="h-6 w-6" />
                      PROCESAR PAGO - ${(calculateTotal() * 1.16).toFixed(2)} MXN
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Panel derecho - Búsqueda y productos */}
          <div className="space-y-4 lg:space-y-6">
            {/* Búsqueda de productos */}
            <div className="bg-white rounded-lg shadow-md border border-gray-300 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">🔍 Buscar Productos</h2>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors self-start sm:self-auto"
                >
                  {showAdvancedFilters ? '🔼 Ocultar filtros' : '🔽 Filtros avanzados'}
                </button>
              </div>
              
              <div className="relative mb-6">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, ID o código..."
                  className="w-full px-4 py-3 pl-12 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              
              {/* Filtros avanzados */}
              {showAdvancedFilters && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">⚙️ Filtros Avanzados</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filtro por categoría */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                      <input
                        type="text"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        placeholder="Ej: dental, limpieza..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* Filtro por stock */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">Todos los productos</option>
                        <option value="in_stock">Con stock disponible</option>
                        <option value="low_stock">Stock bajo (≤5)</option>
                      </select>
                    </div>
                    
                    {/* Botón limpiar filtros */}
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setCategoryFilter('')
                          setPriceRange({ min: '', max: '' })
                          setStockFilter('all')
                          setSearchTerm('')
                        }}
                        className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                      >
                        🗑️ Limpiar
                      </button>
                    </div>
                  </div>
                  
                  {/* Filtro por rango de precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precio</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        placeholder="Precio mínimo"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                      <span className="text-gray-500 font-medium">-</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        placeholder="Precio máximo"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  {/* Resumen de filtros activos */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {categoryFilter && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Categoría: {categoryFilter}
                      </span>
                    )}
                    {(priceRange.min || priceRange.max) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Precio: ${priceRange.min || '0'} - ${priceRange.max || '∞'}
                      </span>
                    )}
                    {stockFilter !== 'all' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        {stockFilter === 'in_stock' ? 'Con stock' : 'Stock bajo'}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Escáner de códigos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">📱 Escanear Código</h3>
                <form onSubmit={handleBarcodeSearch} className="space-y-3">
                  <div className="relative">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Escanea código de barras/QR..."
                      className="w-full px-4 py-3 pl-10 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                    <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="submit" 
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
                  >
                      🔍 Buscar
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowScanner(true)}
                      className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm"
                    >
                      📷 Cámara
                  </button>
                </div>
              </form>
              
              {/* Escáner de códigos de barras */}
              {showScanner && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <BarcodeScanner 
                    onScan={async (decodedText) => {
                      setBarcodeInput(decodedText);
                      setShowScanner(false);
                      
                      try {
                        // Primero intentar buscar por código de barras usando la API
                        const barcodeResponse = await fetch(`/api/productos/barcode/${decodedText.trim()}`);
                        
                        if (barcodeResponse.ok) {
                          const product = await barcodeResponse.json();
                          log.error('Producto encontrado por código de barras:', product);
                          
                          if (product.isAvailable) {
                            addToCart(product);
                            setBarcodeInput('');
                            toast.success(`Producto agregado: ${product.name}`);
                          } else {
                            toast.error(`Producto encontrado pero sin stock: ${product.name}`);
                          }
                          return;
                        }
                        
                        // Si no se encuentra por código de barras, buscar por ID o slug en la lista local
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
                      } catch (error) {
                        log.error('Error al buscar producto:', error);
                        toast.error('Error al buscar el producto');
                      }
                    }}
                    onClose={() => setShowScanner(false)}
                  />
                </div>
              )}
            </div>
            
              {/* Lista de productos mejorada */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    Productos Disponibles
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">
                    {filteredProducts.length} productos
                  </div>
              </div>
              
              {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-2">No se encontraron productos</p>
                    <p className="text-gray-400 text-sm">Intenta ajustar tu búsqueda</p>
                </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4 max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredProducts.map(product => (
                        <div key={product.id} className="group bg-white border-2 border-gray-100 rounded-xl p-3 sm:p-4 hover:border-blue-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                        {/* Imagen del producto */}
                        <div className="relative mb-4">
                          <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={product.images && product.images[0] ? product.images[0] : '/img/placeholder.png'} 
                          alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                          {/* Badge de stock */}
                          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-700' 
                              : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock > 0 ? `${product.stock} unid.` : 'Agotado'}
                          </div>
                        </div>
                        
                        {/* Información del producto */}
                        <div className="space-y-2 mb-4">
                          <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h4>
                          <p className="text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-md inline-block">
                            {product.category?.name || 'Sin categoría'}
                          </p>
                        </div>
                        
                        {/* Precio y botón */}
                        <div className="space-y-3">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                            className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                              product.stock > 0 
                                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95 group-hover:bg-blue-700' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {product.stock > 0 ? (
                              <>
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Agregar al Carrito</span>
                                <span className="sm:hidden">Agregar</span>
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                Sin Stock
                              </>
                            )}
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
                </div>
        </div>
      </div>

      {/* Modal de confirmación de venta mejorado */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-1 sm:p-2 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl sm:max-w-4xl lg:max-w-5xl w-full max-h-[98vh] overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold">Procesar Pago</h3>
                    <p className="text-blue-100 text-xs sm:text-sm">Confirma los detalles de la venta</p>
                        </div>
                      </div>
                          <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

            <div className="p-3 sm:p-6 max-h-[calc(98vh-120px)] overflow-y-auto custom-scrollbar">
              {/* Resumen compacto de productos */}
              <div className="mb-4 sm:mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Productos ({cartItems.length})
                </h4>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg p-2 sm:p-3 shadow-sm">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image || '/img/placeholder.png'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.name}</p>
                        <p className="text-gray-500 text-xs">{item.quantity} × ${item.price.toFixed(2)}</p>
                </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 text-xs sm:text-sm">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
                  ))}
        </div>
      </div>

              {/* Resumen financiero */}
              <div className="mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} productos):</span>
                    <span>${calculateTotal().toFixed(2)}</span>
              </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span>IVA (16%):</span>
                    <span>${(calculateTotal() * 0.16).toFixed(2)}</span>
              </div>
                  <div className="border-t border-gray-300 pt-2 sm:pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-xl font-bold text-gray-900">Total a Pagar:</span>
                      <span className="text-xl sm:text-3xl font-bold text-green-600">${(calculateTotal() * 1.16).toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm text-right">MXN</p>
                  </div>
                </div>
              </div>

              {/* Método de pago mejorado */}
              <div className="mb-4 sm:mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Método de Pago
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      log.error('💰 Cambiando a efectivo')
                      setPaymentMethod('efectivo')
                    }}
                    className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === 'efectivo'
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                      <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />
                      <span className="font-semibold text-xs sm:text-sm">Efectivo</span>
                      <span className="text-xs text-gray-500 hidden sm:block">Pago en efectivo</span>
                    </div>
                    {paymentMethod === 'efectivo' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      log.error('💳 Cambiando a tarjeta')
                      setPaymentMethod('tarjeta')
                    }}
                    className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === 'tarjeta'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                      <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
                      <span className="font-semibold text-xs sm:text-sm">Tarjeta</span>
                      <span className="text-xs text-gray-500 hidden sm:block">Débito/Crédito</span>
                    </div>
                    {paymentMethod === 'tarjeta' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Información adicional según método de pago */}
              {paymentMethod === 'efectivo' && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <span className="font-medium text-green-800 text-sm sm:text-base">Pago en Efectivo</span>
                  </div>
                  <p className="text-green-700 text-xs sm:text-sm">Asegúrate de tener el cambio exacto disponible.</p>
                </div>
              )}

              {paymentMethod === 'tarjeta' && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span className="font-medium text-blue-800 text-sm sm:text-base">Pago con Tarjeta</span>
                  </div>
                  <p className="text-blue-700 text-xs sm:text-sm">El cliente deberá insertar o acercar su tarjeta al terminal.</p>
                </div>
              )}
            </div>

            {/* Footer con botones de acción */}
            <div className="bg-gray-50 p-3 sm:p-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 sm:py-3 px-4 sm:px-6 border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  Cancelar
                </button>
                <button
                  onClick={processPhysicalSale}
                  disabled={processingOrder}
                  className="flex-2 py-2 sm:py-3 px-4 sm:px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                  {processingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                      <span className="hidden sm:inline">Procesando Venta...</span>
                      <span className="sm:hidden">Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Confirmar Pago - ${(calculateTotal() * 1.16).toFixed(2)} MXN</span>
                      <span className="sm:hidden">Confirmar - ${(calculateTotal() * 1.16).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito con opción de imprimir */}
      {lastSale && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Save className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">¡Venta Registrada!</h3>
                <p className="text-lg text-gray-600">La venta se ha procesado correctamente.</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                  <span className="text-lg text-gray-700 font-medium">Ticket #:</span>
                  <span className="text-lg font-bold text-blue-600">{lastSale.id}</span>
                </div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                  <span className="text-lg text-gray-700 font-medium">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${lastSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-700 font-medium">Método:</span>
                  <span className="text-lg font-bold text-purple-600">{paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setLastSale(null)}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={printTicket}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-lg shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Printer className="h-5 w-5" />
                    Imprimir Ticket
                  </button>
                </div>
                
                {/* Botón de impresión Bluetooth */}
                <button
                  onClick={() => printTicketBluetooth(lastSale)}
                  disabled={!isPrinterConnected}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                >
                  <Bluetooth className="h-4 w-4" />
                  {isPrinterConnected ? 'Imprimir Bluetooth' : 'Conectar Impresora'}
                </button>
                

                
                {/* Botón alternativo de impresión */}
                <button
                  onClick={printTicketAlternative}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir (Método Alternativo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración Bluetooth */}
      {showBluetoothModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bluetooth className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Configurar Impresora Bluetooth</h3>
              </div>

              {/* Estado de conexión */}
              <div className="mb-4 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estado:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    isPrinterConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isPrinterConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                {deviceName && (
                  <div className="mt-2 text-sm text-gray-600">
                    Dispositivo: {deviceName}
                  </div>
                )}
              </div>

              {/* Botones de control */}
              <div className="space-y-3 mb-4">
                {!isPrinterConnected ? (
                  <button
                    onClick={connectPrinter}
                    disabled={isPrinting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Bluetooth className="h-4 w-4" />
                    {isPrinting ? 'Conectando...' : 'Conectar Impresora'}
                  </button>
                ) : (
                  <button
                    onClick={disconnectPrinter}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Desconectar
                  </button>
                )}
              </div>

              {/* Error */}
              {printerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  <span>{printerError}</span>
                </div>
              )}

              {/* Información de compatibilidad */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
                <h4 className="font-medium mb-1">📱 Requisitos:</h4>
                <ul className="text-xs space-y-1">
                  <li>• Navegador: Chrome, Edge, Opera</li>
                  <li>• Conexión HTTPS</li>
                  <li>• Bluetooth habilitado</li>
                  <li>• Impresora térmica compatible</li>
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBluetoothModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                {isPrinterConnected && lastSale && (
                  <button
                    onClick={() => {
                      printTicketBluetooth(lastSale)
                      setShowBluetoothModal(false)
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir Ahora
                  </button>
                )}
                {isPrinterConnected && !lastSale && (
                  <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-center text-sm">
                    No hay venta reciente para imprimir
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Ticket */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        lastSale={lastSale}
        paymentMethod={paymentMethod}
      />

      {/* Escáner Externo */}
      <ExternalScanner
        isOpen={showExternalScanner}
        onScan={async (decodedText) => {
          setBarcodeInput(decodedText);
          setShowExternalScanner(false);
          
          try {
            // Primero intentar buscar por código de barras usando la API
            const barcodeResponse = await fetch(`/api/productos/barcode/${decodedText.trim()}`);
            
            if (barcodeResponse.ok) {
              const product = await barcodeResponse.json();
              log.error('Producto encontrado por código de barras (escáner externo):', product);
              
              if (product.isAvailable) {
                addToCart(product);
                setBarcodeInput('');
                toast.success(`Producto agregado: ${product.name}`);
              } else {
                toast.error(`Producto encontrado pero sin stock: ${product.name}`);
              }
              return;
            }
            
            // Si no se encuentra por código de barras, buscar por ID o slug en la lista local
            const product = products.find(p => 
              p.id === decodedText.trim() || 
              p.slug === decodedText.trim()
            );
            
            if (product) {
              addToCart(product);
              setBarcodeInput('');
              toast.success(`Producto agregado: ${product.name}`);
            } else {
              toast.error('Producto no encontrado');
            }
          } catch (error) {
            log.error('Error al buscar producto con escáner externo:', error);
            toast.error('Error al buscar el producto');
          }
        }}
        onClose={() => setShowExternalScanner(false)}
      />

      {/* Modal de ayuda de atajos de teclado */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">⌨️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Atajos de Teclado</h3>
                    <p className="text-purple-100 text-sm">Acelera tu trabajo con estos atajos</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto custom-scrollbar">
              <div className="grid gap-4">
                {/* Atajos principales */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Navegación y Búsqueda
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Enfocar campo de búsqueda</span>
                      <kbd className="px-3 py-1 bg-blue-200 text-blue-800 rounded-lg font-mono text-sm font-bold">F1</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Abrir escáner de código</span>
                      <kbd className="px-3 py-1 bg-blue-200 text-blue-800 rounded-lg font-mono text-sm font-bold">F4</kbd>
                    </div>
                  </div>
                </div>

                {/* Atajos de carrito */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Gestión del Carrito
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Procesar pago</span>
                      <kbd className="px-3 py-1 bg-green-200 text-green-800 rounded-lg font-mono text-sm font-bold">F2</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Limpiar carrito</span>
                      <kbd className="px-3 py-1 bg-green-200 text-green-800 rounded-lg font-mono text-sm font-bold">F3</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Remover último producto</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 bg-green-200 text-green-800 rounded font-mono text-sm font-bold">Ctrl</kbd>
                        <span className="text-green-800">+</span>
                        <kbd className="px-2 py-1 bg-green-200 text-green-800 rounded font-mono text-sm font-bold">-</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Atajos generales */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <X className="h-5 w-5" />
                    Controles Generales
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Cerrar modales</span>
                      <kbd className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg font-mono text-sm font-bold">Escape</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Mostrar/ocultar esta ayuda</span>
                      <kbd className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg font-mono text-sm font-bold">F5</kbd>
                    </div>
                  </div>
                </div>

                {/* Consejos */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    💡 Consejos
                  </h4>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Los atajos funcionan incluso cuando hay campos de texto enfocados</li>
                    <li>• Usa F1 para buscar productos rápidamente</li>
                    <li>• F2 solo funciona si hay productos en el carrito</li>
                    <li>• Escape cierra cualquier modal abierto</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>Entendido</span>
                  <kbd className="px-2 py-1 bg-purple-500 text-white rounded text-xs">F5</kbd>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de descuento */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">💰 Aplicar Descuento</h3>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Tipo de descuento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de descuento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDiscountType('percentage')}
                    className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                      discountType === 'percentage'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Porcentaje (%)
                  </button>
                  <button
                    onClick={() => setDiscountType('fixed')}
                    className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                      discountType === 'fixed'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Monto fijo ($)
                  </button>
                </div>
              </div>
              
              {/* Valor del descuento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor del descuento {discountType === 'percentage' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'Ej: 10' : 'Ej: 50.00'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  step={discountType === 'percentage' ? '1' : '0.01'}
                />
              </div>
              
              {/* Información del descuento */}
              {discountValue && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Subtotal actual:</strong> ${calculateSubtotal().toFixed(2)}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Descuento:</strong> ${
                      discountType === 'percentage'
                        ? ((calculateSubtotal() * parseFloat(discountValue || '0')) / 100).toFixed(2)
                        : parseFloat(discountValue || '0').toFixed(2)
                    }
                  </p>
                  <p className="text-sm font-semibold text-blue-900">
                    <strong>Total con descuento:</strong> ${
                      discountType === 'percentage'
                        ? (calculateSubtotal() - (calculateSubtotal() * parseFloat(discountValue || '0')) / 100).toFixed(2)
                        : (calculateSubtotal() - parseFloat(discountValue || '0')).toFixed(2)
                    }
                  </p>
                </div>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={applyDiscount}
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Aplicar Descuento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de variantes */}
      {showVariantModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Seleccionar Variante
                </h3>
                <button
                  onClick={() => {
                    setShowVariantModal(false)
                    setSelectedProduct(null)
                    setSelectedVariant(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-600">Precio base: ${selectedProduct.price}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <h5 className="font-medium text-gray-700">Variantes disponibles:</h5>
                {selectedProduct.variants?.map((variant: any) => (
                  <div
                    key={variant.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {variant.color && <span className="text-blue-600">{variant.color}</span>}
                          {variant.color && variant.size && <span className="text-gray-400"> • </span>}
                          {variant.size && <span className="text-green-600">{variant.size}</span>}
                        </div>
                        <div className="text-sm text-gray-600">
                          Stock: {variant.stock} unidades
                          {variant.price && variant.price !== selectedProduct.price && (
                            <span className="ml-2 text-blue-600 font-medium">
                              ${variant.price}
                            </span>
                          )}
                        </div>
                      </div>
                      {variant.stock <= 0 && (
                        <span className="text-xs text-red-500 font-medium">Sin stock</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowVariantModal(false)
                    setSelectedProduct(null)
                    setSelectedVariant(null)
                  }}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (selectedVariant) {
                      addToCart(selectedProduct, selectedVariant)
                      setShowVariantModal(false)
                      setSelectedProduct(null)
                      setSelectedVariant(null)
                    } else {
                      toast.error('Por favor selecciona una variante')
                    }
                  }}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}