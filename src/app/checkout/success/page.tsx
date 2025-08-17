"use client"

import { useEffect, useState, Suspense } from 'react'
import { log } from '@/lib/secureLogger'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, CheckCircle, AlertCircle, Tag } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  // Primer useEffect para crear el pedido con los datos de la sesión
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setStatus('error')
      setError('No se encontró información de la sesión de pago')
      return
    }

    // Intentar crear el pedido con los datos de la sesión
    const createOrder = async () => {
      try {
        // Obtener datos de la sesión desde localStorage (almacenados antes del pago)
        const orderDataStr = localStorage.getItem('pendingOrder')
        if (!orderDataStr) {
          throw new Error('No se encontraron datos del pedido')
        }

        const orderData = JSON.parse(orderDataStr)
        log.error('Creando pedido con datos:', orderData)
        
        // Verificar si hay información de cupón
        const hasCoupon = orderData.coupon && orderData.totals.discount > 0

        const response = await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stripeSessionId: sessionId,
            ...orderData
          })
        })

        const result = await response.json()

        if (response.ok) {
          setOrderId(result.order.id)
          setStatus('success')
          // Limpiar datos temporales
          localStorage.removeItem('pendingOrder')
        } else {
          if (response.status === 409) {
            // Pedido ya existe
            setStatus('success')
            setOrderId(result.order?.id || 'existente')
          } else {
            throw new Error(result.error || 'Error al crear pedido')
          }
        }
      } catch (err: any) {
        log.error('Error al crear pedido:', err)
        setStatus('error')
        setError(err.message || 'Error al procesar el pedido')
      }
    }

    createOrder()
  }, [searchParams])
  
  // Segundo useEffect para recuperar datos del pedido del localStorage
  useEffect(() => {
    const storedOrderData = localStorage.getItem('pendingOrder')
    if (storedOrderData) {
      try {
        const parsedData = JSON.parse(storedOrderData)
        setOrderDetails(parsedData)
      } catch (err) {
        log.error('Error al parsear detalles del pedido:', err)
      }
    }
  }, [])

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-elegant">
        <div className="bg-white rounded-xl shadow-elegant p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2 text-neutral-700">Procesando tu pedido...</h2>
          <p className="text-neutral-600">Por favor espera mientras confirmamos tu compra.</p>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-elegant">
        <div className="bg-white rounded-xl shadow-elegant p-8 w-full max-w-md text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-neutral-700">Error al procesar pedido</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Link href="/productos" className="btn-primary block">
              Seguir comprando
            </Link>
            <Link href="/contacto" className="btn-secondary block">
              Contactar soporte
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Los datos del pedido ya se recuperan en el segundo useEffect al inicio del componente

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-elegant">
      <div className="bg-white rounded-xl shadow-elegant p-8 w-full max-w-md">
        <div className="text-center">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-neutral-700">¡Compra exitosa!</h2>
          <p className="text-neutral-600 mb-4">
            Tu pago ha sido procesado correctamente y tu pedido ha sido registrado.
          </p>
          {orderId && (
            <p className="text-sm text-neutral-500 mb-6">
              Número de pedido: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
        </div>
        
        {orderDetails && (
          <div className="mt-6 border-t border-neutral-200 pt-4">
            <h3 className="font-medium text-lg mb-2">Resumen del pedido</h3>
            
            {/* Lista de productos */}
            <div className="mb-4">
              {orderDetails.items.map((item: any, index: number) => (
                <div key={index} className="py-2 border-b border-neutral-100 last:border-b-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-neutral-500 flex justify-between">
                    <div>
                      <span>Cantidad: {item.quantity}</span>
                      {(item.size || item.color) && (
                        <span className="ml-2">
                          {item.size && <span className="mr-1">Talla: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </span>
                      )}
                    </div>
                    <span>${item.price.toFixed(2)} c/u</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${orderDetails.totals.subtotal.toFixed(2)}</span>
              </div>
              
              {orderDetails.coupon && orderDetails.totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    Descuento ({orderDetails.coupon.code})
                  </span>
                  <span>-${orderDetails.totals.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Envío</span>
                <span>
                  {orderDetails.totals.shipping === 0 
                    ? 'Gratis' 
                    : `$${orderDetails.totals.shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>IVA (16%)</span>
                <span>${orderDetails.totals.tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg border-t border-neutral-200 pt-2 mt-2">
                <span>Total</span>
                <span>${orderDetails.totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2 mt-6">
          <Link href="/ofertas" className="btn-primary block text-center">
            Seguir comprando
          </Link>
          <Link href="/perfil" className="btn-secondary block text-center">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}