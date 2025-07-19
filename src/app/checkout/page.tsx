"use client"

import { useCart } from '@/hooks/useCart'
import { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'

export default function CheckoutPage() {
  const { cartItems, getTotal, clearCart, isHydrated } = useCart()
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: '',
  })
  const [pedidoRealizado, setPedidoRealizado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar Stripe después de la hidratación
  useEffect(() => {
    if (isHydrated) {
      // Obtener la clave desde el servidor
      fetch('/api/stripe-config')
        .then(res => res.json())
        .then(data => {
          if (data.publishableKey) {
            setStripePromise(loadStripe(data.publishableKey))
          } else {
            console.error('No se pudo obtener la clave de Stripe')
          }
        })
        .catch(err => {
          console.error('Error al cargar configuración de Stripe:', err)
        })
    }
  }, [isHydrated])

  const subtotal = getTotal()
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.16
  const total = subtotal + shipping + tax

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validar que Stripe esté configurado
    if (!stripePromise) {
      setError('Error de configuración: Stripe no está configurado correctamente')
      setLoading(false)
      return
    }

    try {
      const stripe = await stripePromise
      if (!stripe) {
        setError('Error al cargar Stripe. Verifica tu conexión a internet.')
        setLoading(false)
        return
      }

      // Preparar datos del pedido
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        customer: form,
        totals: {
          subtotal: subtotal,
          shipping: shipping,
          tax: tax,
          total: total
        }
      }

      console.log('Enviando datos del pedido:', orderData)

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      const data = await res.json()
      console.log('Respuesta del checkout:', data)
      
      if (data.url) {
        // Almacenar datos del pedido para la página de éxito
        localStorage.setItem('pendingOrder', JSON.stringify({
          items: orderData.items,
          customer: orderData.customer,
          totals: orderData.totals
        }))
        
        // Limpiar carrito y redireccionar
        clearCart()
        window.location.href = data.url
      } else {
        setError(data.error || 'Error al procesar el pago')
      }
    } catch (err: any) {
      setError('Error inesperado al conectar con la pasarela de pago')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading mientras se hidrata
  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-gradient-elegant py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-elegant p-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600">Cargando carrito...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (pedidoRealizado) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-elegant">
        <div className="bg-white rounded-xl shadow-elegant p-8 w-full max-w-md text-center">
          <ShoppingBag size={48} className="text-primary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-neutral-700">¡Gracias por tu compra!</h2>
          <p className="text-neutral-600 mb-6">Tu pedido ha sido recibido y está siendo procesado.</p>
          <Link href="/productos" className="btn-primary py-2 px-6 rounded-lg font-medium">Seguir comprando</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-elegant py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-elegant p-8">
          <h1 className="text-2xl font-bold text-neutral-700 mb-6">Finalizar compra</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resumen del pedido */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
              {cartItems.length === 0 ? (
                <p className="text-neutral-500">Tu carrito está vacío.</p>
              ) : (
                <ul className="divide-y divide-neutral-200 mb-4">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold text-primary-700">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (16%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {/* Formulario de envío */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Datos de envío</h2>
              <input type="text" name="nombre" required placeholder="Nombre completo" className="input-field w-full" value={form.nombre} onChange={handleChange} />
              <input type="email" name="email" required placeholder="Correo electrónico" className="input-field w-full" value={form.email} onChange={handleChange} />
              <input type="text" name="telefono" required placeholder="Teléfono" className="input-field w-full" value={form.telefono} onChange={handleChange} />
              <input type="text" name="direccion" required placeholder="Dirección" className="input-field w-full" value={form.direccion} onChange={handleChange} />
              <input type="text" name="ciudad" required placeholder="Ciudad" className="input-field w-full" value={form.ciudad} onChange={handleChange} />
              <input type="text" name="estado" required placeholder="Estado" className="input-field w-full" value={form.estado} onChange={handleChange} />
              <input type="text" name="codigoPostal" required placeholder="Código Postal" className="input-field w-full" value={form.codigoPostal} onChange={handleChange} />
              <input type="text" name="pais" required placeholder="País" className="input-field w-full" value={form.pais} onChange={handleChange} />
              <button type="submit" className="btn-primary w-full py-3 font-semibold" disabled={loading}>
                {loading ? 'Redirigiendo a la pasarela de pago...' : 'Pagar con tarjeta'}
              </button>
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              <Link href="/carrito" className="btn-secondary w-full text-center py-3 mt-2 flex items-center justify-center gap-2">
                <ArrowLeft className="h-5 w-5" /> Volver al carrito
              </Link>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
} 