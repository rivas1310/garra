"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        console.log('Creando pedido con datos:', orderData)

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
        console.error('Error al crear pedido:', err)
        setStatus('error')
        setError(err.message || 'Error al procesar el pedido')
      }
    }

    createOrder()
  }, [searchParams])

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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-elegant">
      <div className="bg-white rounded-xl shadow-elegant p-8 w-full max-w-md text-center">
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
        <div className="space-y-2">
          <Link href="/productos" className="btn-primary block">
            Seguir comprando
          </Link>
          <Link href="/perfil" className="btn-secondary block">
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