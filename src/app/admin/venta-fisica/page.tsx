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
  Camera,
  Printer,
  CreditCard,
  DollarSign,
  X
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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta'>('efectivo')
  const [lastSale, setLastSale] = useState<any>(null)
  
  // Cargar productos
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Agregar timestamp para evitar caché
      const timestamp = Date.now();
      const response = await fetch(`/api/productos?admin=true&t=${timestamp}`)
      const data = await response.json()
      console.log('Datos recibidos en venta física:', data);
      if (Array.isArray(data)) {
        setProducts(data)
      } else if (Array.isArray(data.productos)) {
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

  // Abrir modal de confirmación de venta
  const openPaymentModal = () => {
    console.log('🔍 Abriendo modal de pago...')
    console.log('📦 Items en carrito:', cartItems.length)
    
    if (cartItems.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    
    console.log('✅ Modal abierto, showPaymentModal:', true)
    setShowPaymentModal(true)
  }

  // Procesar venta física
  const processPhysicalSale = async () => {
    console.log('🚀 Procesando venta física...')
    console.log('💳 Método de pago seleccionado:', paymentMethod)
    
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
        console.log('🖨️ Imprimiendo ticket automáticamente...')
        setTimeout(() => {
          // Usar los datos de la venta recién creada para imprimir
          printTicketWithData(result)
        }, 1000) // Esperar 1 segundo para que se procese la venta
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
    console.log('🖨️ Iniciando impresión del ticket...')
    console.log('📋 Datos de la venta:', lastSale)
    
    if (!lastSale) {
      toast.error('No hay datos de venta para imprimir')
      return
    }
    
    try {
      const printWindow = window.open('', '_blank', 'width=600,height=800')
      if (!printWindow) {
        toast.error('No se pudo abrir la ventana de impresión. Verifica que el bloqueador de popups esté desactivado.')
        return
      }

      const ticketContent = `
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
              line-height: 1.4;
              margin: 0; 
              padding: 10px; 
              background: white;
              color: black;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 5px; 
              text-transform: uppercase;
            }
            .subtitle { 
              font-size: 10px; 
              color: #333; 
              margin-bottom: 2px;
            }
            .divider { 
              border-top: 1px dashed #000; 
              margin: 10px 0; 
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0; 
              font-size: 11px;
            }
            .item-name { 
              flex: 1; 
              text-align: left; 
            }
            .item-price { 
              text-align: right; 
              font-weight: bold;
            }
            .total { 
              font-weight: bold; 
              border-top: 2px solid #000; 
              padding-top: 10px; 
              margin-top: 10px; 
            }
            .footer { 
              text-align: center; 
              margin-top: 20px; 
              font-size: 10px; 
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            .payment-method {
              font-size: 10px;
              color: #333;
              margin-top: 5px;
            }
            @media print { 
              body { margin: 0; padding: 5px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Garras Felinas</div>
            <div class="subtitle">Venta Física</div>
            <div class="subtitle">${new Date().toLocaleString('es-MX', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
            <div class="subtitle">Ticket #${lastSale.id}</div>
          </div>
          
          <div class="divider"></div>
          
          ${lastSale.items.map((item: any) => `
            <div class="item">
              <span class="item-name">${item.product?.name || 'Producto'} x${item.quantity}</span>
              <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          
          <div class="divider"></div>
          
          <div class="total">
            <div class="item">
              <span class="item-name">TOTAL</span>
              <span class="item-price">$${lastSale.total.toFixed(2)}</span>
            </div>
            <div class="payment-method">Método de pago: ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</div>
          </div>
          
          <div class="footer">
            <div>¡Gracias por su compra!</div>
            <div>www.garrasfelinas.com</div>
            <div style="margin-top: 10px; font-size: 8px;">
              Este ticket es un comprobante de venta
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

      console.log('📄 Contenido del ticket generado')
      printWindow.document.write(ticketContent)
      printWindow.document.close()
      
      // Esperar a que se cargue el contenido antes de imprimir
      printWindow.onload = () => {
        console.log('✅ Ventana de impresión cargada')
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
          console.log('🖨️ Comando de impresión enviado')
          
          // Cerrar la ventana después de un tiempo
          setTimeout(() => {
            printWindow.close()
            console.log('✅ Ventana de impresión cerrada')
            toast.success('Ticket enviado a impresión')
          }, 2000)
        }, 1000)
      }
      
    } catch (error) {
      console.error('❌ Error al imprimir:', error)
      toast.error('Error al generar el ticket de impresión')
    }
  }

  // Función para imprimir ticket con datos específicos
  const printTicketWithData = (saleData: any) => {
    console.log('🖨️ Imprimiendo ticket mejorado...')
    console.log('📋 Datos de la venta:', saleData)
    
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

      // Información de la empresa
      const companyInfo = {
        name: 'Garras Felinas',
        logo: 'img/garrasfelinas_logo.png',
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
              font-size: 11px; 
              line-height: 1.3;
              margin: 0; 
              padding: 8px; 
              background: white;
              color: black;
              max-width: 400px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px; 
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
            }
            .logo {
              max-width: 200px;
              height: auto;
              margin-bottom: 5px;
            }
            .title { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 3px; 
              text-transform: uppercase;
            }
            .subtitle { 
              font-size: 9px; 
              color: #333; 
              margin-bottom: 1px;
            }
            .company-info {
              font-size: 8px;
              margin: 5px 0;
            }
            .divider { 
              border-top: 1px dashed #000; 
              margin: 8px 0; 
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin: 3px 0; 
              font-size: 10px;
            }
            .item-details {
              font-size: 8px;
              color: #666;
              margin-left: 10px;
            }
            .item-name { 
              flex: 1; 
              text-align: left; 
            }
            .item-price { 
              text-align: right; 
              font-weight: bold;
            }
            .total { 
              font-weight: bold; 
              border-top: 2px solid #000; 
              padding-top: 8px; 
              margin-top: 8px; 
            }
            .footer { 
              text-align: center; 
              margin-top: 15px; 
              font-size: 8px; 
              border-top: 1px dashed #000;
              padding-top: 8px;
            }
            .payment-method {
              font-size: 9px;
              color: #333;
              margin-top: 3px;
            }
            .tax-info {
              font-size: 8px;
              color: #666;
              margin-top: 3px;
            }
            @media print { 
              body { margin: 0; padding: 5px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${companyInfo.logo}" alt="${companyInfo.name}" class="logo">
            <div class="title">${companyInfo.name}</div>
            <div class="subtitle">Venta Física</div>
            <div class="company-info">
              ${companyInfo.address}<br>
              Tel: ${companyInfo.phone}<br>
              ${companyInfo.email}<br>
              RFC: ${companyInfo.rfc}
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="item">
            <span class="item-name">Fecha:</span>
            <span class="item-price">${new Date().toLocaleString('es-MX', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          <div class="item">
            <span class="item-name">Ticket #:</span>
            <span class="item-price">${saleData.id}</span>
          </div>
          <div class="item">
            <span class="item-name">Cajero:</span>
            <span class="item-price">Admin</span>
          </div>
          
          <div class="divider"></div>
          
          ${saleData.items.map((item: any) => `
            <div class="item">
              <span class="item-name">${item.product?.name || 'Producto'} x${item.quantity}</span>
              <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div class="item-details">
              SKU: ${item.product?.sku || 'N/A'} | Precio unitario: $${item.price.toFixed(2)}
            </div>
          `).join('')}
          
          <div class="divider"></div>
          
          <div class="total">
            <div class="item">
              <span class="item-name">Subtotal:</span>
              <span class="item-price">$${(saleData.total * 0.84).toFixed(2)}</span>
            </div>
            <div class="item">
              <span class="item-name">IVA (16%):</span>
              <span class="item-price">$${(saleData.total * 0.16).toFixed(2)}</span>
            </div>
            <div class="item">
              <span class="item-name">TOTAL:</span>
              <span class="item-price">$${saleData.total.toFixed(2)}</span>
            </div>
            <div class="payment-method">Método de pago: ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</div>
            <div class="tax-info">Este documento es un comprobante fiscal</div>
          </div>
          
          <div class="footer">
            <div>¡Gracias por su compra!</div>
            <div>${companyInfo.website}</div>
            <div style="margin-top: 5px; font-size: 7px;">
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

      console.log('📄 Contenido del ticket mejorado generado')
      printWindow.document.write(ticketContent)
      printWindow.document.close()
      
      // Esperar a que se cargue el contenido antes de imprimir
      printWindow.onload = () => {
        console.log('✅ Ventana de impresión cargada')
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
          console.log('🖨️ Comando de impresión enviado')
          
          // Cerrar la ventana después de un tiempo
          setTimeout(() => {
            printWindow.close()
            console.log('✅ Ventana de impresión cerrada')
            toast.success('Ticket mejorado enviado a impresión')
          }, 2000)
        }, 1000)
      }
      
    } catch (error) {
      console.error('❌ Error al imprimir:', error)
      toast.error('Error al generar el ticket de impresión')
    }
  }

  // Función alternativa de impresión (fallback)
  const printTicketAlternative = () => {
    console.log('🖨️ Usando método alternativo de impresión...')
    
    if (!lastSale) {
      toast.error('No hay datos de venta para imprimir')
      return
    }

    try {
      // Crear un elemento temporal para imprimir
      const printContent = document.createElement('div')
      printContent.innerHTML = `
        <div style="font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; max-width: 300px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">GARRAS FELINAS</div>
            <div style="font-size: 10px; color: #333;">Venta Física</div>
            <div style="font-size: 10px; color: #333;">${new Date().toLocaleString()}</div>
            <div style="font-size: 10px; color: #333;">Ticket #${lastSale.id}</div>
          </div>
          
          <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
          
          ${lastSale.items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px;">
              <span>${item.product?.name || 'Producto'} x${item.quantity}</span>
              <span style="font-weight: bold;">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          
          <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
          
          <div style="font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>TOTAL</span>
              <span>$${lastSale.total.toFixed(2)}</span>
            </div>
            <div style="font-size: 10px; color: #333; margin-top: 5px;">
              Método de pago: ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px;">
            <div>¡Gracias por su compra!</div>
            <div>www.garrasfelinas.com</div>
          </div>
        </div>
      `

      // Agregar al DOM temporalmente
      document.body.appendChild(printContent)
      
      // Imprimir
      window.print()
      
      // Remover del DOM
      document.body.removeChild(printContent)
      
      toast.success('Ticket enviado a impresión')
      
    } catch (error) {
      console.error('❌ Error en impresión alternativa:', error)
      toast.error('Error al imprimir el ticket')
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
                    onScan={async (decodedText) => {
                      setBarcodeInput(decodedText);
                      setShowScanner(false);
                      
                      try {
                        // Primero intentar buscar por código de barras usando la API
                        const barcodeResponse = await fetch(`/api/productos/barcode/${decodedText.trim()}`);
                        
                        if (barcodeResponse.ok) {
                          const product = await barcodeResponse.json();
                          console.log('Producto encontrado por código de barras:', product);
                          
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
                        console.error('Error al buscar producto:', error);
                        toast.error('Error al buscar el producto');
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
                  onClick={openPaymentModal}
                  disabled={cartItems.length === 0}
                  className="btn-primary w-full flex items-center justify-center text-sm sm:text-base py-2 sm:py-2.5"
                >
                  <Save className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Registrar Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de venta */}
      {console.log('🎭 Estado del modal:', showPaymentModal)}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Venta</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Debug info */}
              <div className="mb-4 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                Debug: Modal abierto - Método actual: {paymentMethod}
              </div>

              {/* Resumen de la venta */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Resumen de la venta:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate">{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Método de pago: {paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      console.log('💰 Cambiando a efectivo')
                      setPaymentMethod('efectivo')
                    }}
                    className={`relative p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${
                      paymentMethod === 'efectivo'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">Efectivo</span>
                    {paymentMethod === 'efectivo' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      console.log('💳 Cambiando a tarjeta')
                      setPaymentMethod('tarjeta')
                    }}
                    className={`relative p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${
                      paymentMethod === 'tarjeta'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">Tarjeta</span>
                    {paymentMethod === 'tarjeta' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={processPhysicalSale}
                  disabled={processingOrder}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {processingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Venta'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito con opción de imprimir */}
      {lastSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Save className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Venta Registrada!</h3>
                <p className="text-gray-600">La venta se ha procesado correctamente.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Ticket #:</span>
                  <span className="font-medium">{lastSale.id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">${lastSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-medium">{paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => setLastSale(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={printTicket}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir Ticket
                  </button>
                </div>
                
                {/* Botón alternativo de impresión */}
                <button
                  onClick={printTicketAlternative}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Printer className="h-3 w-3" />
                  Imprimir (Método Alternativo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}