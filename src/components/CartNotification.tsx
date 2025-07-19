'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import ClientOnly from './ClientOnly'

function CartNotificationContent() {
  const [showNotification, setShowNotification] = useState(false)
  const [lastItemCount, setLastItemCount] = useState(0)
  const { cartItems, getItemCount } = useCart()

  useEffect(() => {
    const currentCount = getItemCount()
    
    // Mostrar notificación cuando se agrega un producto
    if (currentCount > lastItemCount && lastItemCount > 0) {
      setShowNotification(true)
      
      // Ocultar notificación después de 3 segundos
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
    
    setLastItemCount(currentCount)
  }, [cartItems, getItemCount, lastItemCount])

  if (!showNotification) return null

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-full">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Producto agregado</h3>
              <p className="text-sm text-gray-600">
                {getItemCount()} {getItemCount() === 1 ? 'producto' : 'productos'} en tu carrito
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <Link
            href="/carrito"
            className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Ver carrito
          </Link>
          <button
            onClick={() => setShowNotification(false)}
            className="flex-1 bg-gray-200 text-gray-800 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CartNotification() {
  return (
    <ClientOnly>
      <CartNotificationContent />
    </ClientOnly>
  )
} 