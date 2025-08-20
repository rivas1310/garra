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

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Agregar timestamp para evitar caché
      const timestamp = Date.now();
      const response = await fetch(`/api/productos?admin=true&limit=1000&t=${timestamp}`)
      const data = await response.json()
      log.error('Datos recibidos en venta física:', data);
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
            <tr><td class="center bold" colspan="2"><img src="/logos/diseno-sin-titulo-5.png" width="100" height="100" alt="Logo" /></td></tr>
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
            <tr><td class="center bold" colspan="2"><img src="/logos/diseno-sin-titulo-5.png" width="100" height="100" alt="Logo" /></td></tr>
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
            <div class="logo"><img src="/logos/diseno-sin-titulo-5.png" width="100" height="100" alt="Logo" /></div>
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
            
            {/* Indicador de estado Bluetooth */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBluetoothModal(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isPrinterConnected 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                <Bluetooth className={`h-4 w-4 ${isPrinterConnected ? 'text-green-600' : 'text-red-600'}`} />
                {isPrinterConnected ? 'Impresora Conectada' : 'Sin Impresora'}
              </button>
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
                    Cámara
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowExternalScanner(true)}
                    className="btn-secondary text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4 flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Bluetooth className="h-3 w-3 sm:h-4 sm:w-4" />
                    Externo
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
      {log.error('🎭 Estado del modal:', showPaymentModal)}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white  rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold bg-white text-blue-600">Confirmar Venta</h3>
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
                      log.error('💰 Cambiando a efectivo')
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
                      log.error('💳 Cambiando a tarjeta')
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-red-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={processPhysicalSale}
                  disabled={processingOrder}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-green-600 bg-red-500 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {processingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white  mr-2"></div>
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={printTicket}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg bg-blue-500 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir Ticket
                  </button>
                </div>
                
                {/* Botón de impresión Bluetooth */}
                <button
                  onClick={() => printTicketBluetooth(lastSale)}
                  disabled={!isPrinterConnected}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Bluetooth className="h-3 w-3" />
                  {isPrinterConnected ? 'Imprimir Bluetooth' : 'Conectar Impresora'}
                </button>
                

                
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

    </div>
  )
}