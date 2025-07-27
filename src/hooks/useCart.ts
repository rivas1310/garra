import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  stock?: number
  maxStock?: number
  variantId?: string
}

export interface Coupon {
  id: string
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  discountAmount: number
  minOrderValue?: number
}

interface CartStore {
  cartItems: CartItem[]
  isHydrated: boolean
  coupon: Coupon | null
  addToCart: (item: Omit<CartItem, 'quantity'> & { stock?: number }) => { success: boolean; message: string }
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => { success: boolean; message: string }
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  setHydrated: () => void
  getItemQuantity: (id: string) => number
  canAddMore: (id: string, stock: number) => boolean
  applyCoupon: (code: string, subtotal: number) => Promise<{ success: boolean; message: string }>
  removeCoupon: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isHydrated: false,
      coupon: null,
      
      setHydrated: () => {
        set({ isHydrated: true })
      },
      
      getItemQuantity: (id: string) => {
        const { cartItems } = get()
        const item = cartItems.find(cartItem => cartItem.id === id)
        return item ? item.quantity : 0
      },
      
      canAddMore: (id: string, stock: number) => {
        const { cartItems } = get()
        const item = cartItems.find(cartItem => cartItem.id === id)
        const currentQuantity = item ? item.quantity : 0
        return currentQuantity < stock
      },
      
      addToCart: (item) => {
        const { cartItems } = get()
        const existingItem = cartItems.find(
          (cartItem) => cartItem.id === item.id
        )
        
        const currentQuantity = existingItem ? existingItem.quantity : 0
        const availableStock = item.stock || 0
        
        // Verificar si hay stock disponible
        if (availableStock <= 0) {
          return { success: false, message: 'Producto sin stock disponible' }
        }
        
        // Verificar si ya se alcanzó el límite de stock
        if (currentQuantity >= availableStock) {
          return { 
            success: false, 
            message: `Ya tienes ${currentQuantity} unidades en el carrito. Stock máximo: ${availableStock}` 
          }
        }
        
        set((state) => {
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              ),
            }
          }
          
          return {
            cartItems: [...state.cartItems, { ...item, quantity: 1 }],
          }
        })
        
        return { success: true, message: 'Producto agregado al carrito' }
      },
      
      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        }))
      },
      
      updateQuantity: (id, quantity) => {
        const { cartItems } = get()
        const item = cartItems.find(cartItem => cartItem.id === id)
        
        if (!item) {
          return { success: false, message: 'Producto no encontrado en el carrito' }
        }
        
        const availableStock = item.stock || 0
        
        // Verificar que la cantidad no exceda el stock disponible
        if (quantity > availableStock) {
          return { 
            success: false, 
            message: `No puedes agregar más de ${availableStock} unidades. Stock disponible: ${availableStock}` 
          }
        }
        
        // Verificar que la cantidad no sea negativa
        if (quantity < 0) {
          return { success: false, message: 'La cantidad no puede ser negativa' }
        }
        
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
        
        return { success: true, message: 'Cantidad actualizada' }
      },
      
      clearCart: () => {
        set({ cartItems: [], coupon: null })
      },
      
      getTotal: () => {
        const { cartItems } = get()
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      
      getItemCount: () => {
        const { cartItems } = get()
        return cartItems.reduce((count, item) => count + item.quantity, 0)
      },
      
      applyCoupon: async (code: string, subtotal: number) => {
        try {
          const response = await fetch('/api/cupones/validar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, subtotal }),
          })
          
          const data = await response.json()
          
          if (response.ok && data.success) {
            set({ coupon: data.coupon })
            return { success: true, message: data.message || 'Cupón aplicado correctamente' }
          } else {
            return { success: false, message: data.message || 'Cupón inválido' }
          }
        } catch (error) {
          console.error('Error al aplicar cupón:', error)
          return { success: false, message: 'Error al procesar el cupón' }
        }
      },
      
      removeCoupon: () => {
        set({ coupon: null })
      },
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
        }
      },
    }
  )
)