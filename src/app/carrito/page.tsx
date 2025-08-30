'use client'

import { useState } from 'react'
import { log } from '@/lib/secureLogger'
import Link from 'next/link'
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Tag, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

export default function CarritoPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart, applyCoupon, removeCoupon, coupon } = useCart()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id)
      toast.success('Producto eliminado del carrito')
      return
    }
    
    setIsUpdating(id)
    try {
      const result = await updateQuantity(id, newQuantity)
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Error al actualizar cantidad')
    } finally {
      setTimeout(() => setIsUpdating(null), 300)
    }
  }

  const handleRemoveItem = (id: string) => {
    removeFromCart(id)
    toast.success('Producto eliminado del carrito')
  }

  const handleClearCart = () => {
    clearCart()
    toast.success('Carrito vaciado')
  }

  const subtotal = getTotal()
  const shipping = subtotal >= 1500 ? 0 : 200 // Envío gratis para compras de $1500 o más, $200 para menores
  const discount = coupon ? coupon.discountAmount : 0
  const tax = (subtotal - discount) * 0.16 // 16% IVA aplicado después del descuento
  const total = subtotal + shipping + tax - discount
  
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Ingresa un código de cupón')
      return
    }
    
    setIsApplyingCoupon(true)
    try {
      const result = await applyCoupon(couponCode, subtotal)
      if (result.success) {
        toast.success(result.message)
        setCouponCode('')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Error al aplicar el cupón')
      log.error('Error applying coupon:', error)
    } finally {
      setIsApplyingCoupon(false)
    }
  }
  
  const handleRemoveCoupon = () => {
    removeCoupon()
    toast.success('Cupón eliminado')
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-title mb-4">Tu carrito está vacío</h2>
          <p className="text-body mb-8">
            Parece que aún no has agregado productos a tu carrito
          </p>
          <Link href="/productos" className="btn-primary inline-flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Continuar Comprando
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-title mb-2">Carrito de Compras</h1>
          <p className="text-body">
            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-primary-100">
              <div className="p-6 border-b border-primary-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-title">Productos</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>

              <div className="divide-y divide-primary-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-title truncate">
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="text-sm text-muted mt-1">
                            Talla: {item.size}
                          </p>
                        )}
                        {item.color && (
                          <p className="text-sm text-muted">
                            Color: {item.color}
                          </p>
                        )}
                        <p className="text-lg font-semibold text-title mt-2">
                          ${item.price}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating === item.id}
                          className="p-1 rounded-full hover:bg-primary-100 disabled:opacity-50 text-primary-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium text-body">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating === item.id || (item.stock !== undefined && item.quantity >= item.stock)}
                          className={`p-1 rounded-full hover:bg-primary-100 disabled:opacity-50 ${
                            (item.stock !== undefined && item.quantity >= item.stock) 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-primary-600'
                          }`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      {/* Stock Info */}
                      {item.stock !== undefined && (
                        <div className="text-xs text-muted">
                          Stock: {item.quantity}/{item.stock}
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-primary-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1 lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 border border-primary-100">
              <h2 className="text-lg font-semibold text-title mb-4">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium text-body">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Envío</span>
                  <span className="font-medium text-body">
                    {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">IVA (16%)</span>
                  <span className="font-medium text-body">${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Descuento</span>
                    <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-primary-100 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-title">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Mensaje de envío gratis */}
              {subtotal < 1500 && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <span className="text-sm">🚚</span>
                    <span className="text-sm font-medium">
                      ¡Agrega ${(1500 - subtotal).toFixed(2)} más y obtén envío GRATIS!
                    </span>
                  </div>
                </div>
              )}
              
              {subtotal >= 1500 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="text-sm">✅</span>
                    <span className="text-sm font-medium">
                      ¡Felicidades! Tu envío es GRATIS
                    </span>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-title mb-2">
                  Código de Descuento
                </label>
                {coupon ? (
                  <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-primary-800">{coupon.code}</p>
                        <p className="text-xs text-primary-600">
                          {coupon.discountType === 'PERCENTAGE' 
                            ? `${coupon.discountValue}% de descuento` 
                            : `$${coupon.discountValue.toFixed(2)} de descuento`}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="p-1 hover:bg-primary-100 rounded-full text-primary-600"
                      aria-label="Eliminar cupón"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ingresa tu código"
                      className="flex-1 input-field"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <button 
                      className="btn-secondary whitespace-nowrap hover:bg-blue-900 hover:text-white"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                    >
                      {isApplyingCoupon ? (
                        <span className="flex items-center  gap-1">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2  border-primary-600"></div>
                          Aplicando...
                        </span>
                      ) : 'Aplicar'}
                    </button>
                  </div>
                )}
              </div>

              {/* Checkout Button y Continue Shopping */}
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  href="/checkout"
                  className="w-full btn-primary text-center py-3 hover:bg-green-600 hover:text-black text-lg font-semibold"
                >
                  Proceder al Pago
                </Link>
                <Link
                  href="/productos"
                  className="w-full btn-secondary hover:bg-gray-500 hover:font-bold text-center py-3"
                >
                  Continuar Comprando
                </Link>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-primary-50 rounded-lg border font-bold border-primary-100">
                <h3 className="font-bold font- text-title mb-2">Información de Envío</h3>
                <p className="text-sm text-body font-semibold">
                  Envío gratuito en pedidos superiores a $1500
                </p>
                <p className="text-sm text-body font-semibold mt-1">
                  Entrega en 3-5 días hábiles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}