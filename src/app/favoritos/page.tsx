'use client'

import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Eye, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import ProductCard from '@/components/ProductCard'

// Función para obtener la etiqueta legible de condición
const getConditionLabel = (conditionTag?: string): string | null => {
  if (!conditionTag) return null
  
  const conditionLabels: Record<string, string> = {
    'LIKE_NEW': 'Like New',
    'PRE_LOVED': 'Pre Loved',
    'GENTLY_USED': 'Gently Used',
    'VINTAGE': 'Vintage',
    'RETRO': 'Retro',
    'UPCYCLED': 'Upcycled',
    'REWORKED': 'Reworked',
    'DEADSTOCK': 'Deadstock',
    'OUTLET_OVERSTOCK': 'Outlet / Overstock',
    'REPURPOSED': 'Repurposed',
    'NEARLY_NEW': 'Nearly New',
    'DESIGNER_RESALE': 'Designer Resale',
    'SUSTAINABLE_FASHION': 'Sustainable Fashion',
    'THRIFTED': 'Thrifted',
    'CIRCULAR_FASHION': 'Circular Fashion'
  }
  
  return conditionLabels[conditionTag] || null
}

interface FavoriteProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  category: string
  conditionTag?: string
  isOnSale: boolean
  calculatedStock: number
  isActive: boolean
  isAvailable: boolean
  variants: any[]
}

export default function FavoritosPage() {
  const { data: session, status } = useSession()
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  // Cargar favoritos del usuario
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadFavorites()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favoritos')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data)
      } else {
        log.error('Error al cargar favoritos')
      }
    } catch (error) {
      log.error('Error:', error)
      toast.error('Error al cargar tus favoritos')
    } finally {
      setLoading(false)
    }
  }

  // Remover de favoritos
  const removeFromFavorites = async (productId: string) => {
    try {
      const response = await fetch(`/api/favoritos/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(product => product.id !== productId))
        toast.success('Producto removido de favoritos')
      } else {
        toast.error('Error al remover de favoritos')
      }
    } catch (error) {
      log.error('Error:', error)
      toast.error('Error al remover de favoritos')
    }
  }

  // Agregar al carrito
  const handleAddToCart = async (product: FavoriteProduct) => {
    try {
      const result = await addToCart(product)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Error al agregar al carrito')
    }
  }

  // Si no está autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-elegant py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="mx-auto h-16 w-16 text-primary-400 mb-6" />
            <h1 className="text-3xl font-bold text-title mb-4">Mis Favoritos</h1>
            <p className="text-body mb-8 max-w-md mx-auto">
              Inicia sesión para ver y gestionar tus productos favoritos
            </p>
            <div className="space-x-4">
              <Link href="/login" className="btn-primary">
                Iniciar Sesión
              </Link>
              <Link href="/registro" className="btn-secondary">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="mx-auto h-16 w-16 text-primary-400 mb-6 animate-pulse" />
            <h1 className="text-3xl font-bold text-title mb-4">Cargando favoritos...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-elegant py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Heart className="mx-auto h-16 w-16 text-red-700 mb-6" />
          <h1 className="text-3xl font-bold text-white text-title mb-4">Mis Favoritos</h1>
          <p className="text-body text-white font-bold">
            {favorites.length > 0 
              ? `Tienes ${favorites.length} producto${favorites.length !== 1 ? 's' : ''} en tus favoritos`
              : 'Aún no tienes productos favoritos'
            }
          </p>
        </div>

        {/* Productos favoritos */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div key={product.id} className="group card overflow-hidden bg-white rounded-lg shadow-lg">
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.conditionTag && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {getConditionLabel(product.conditionTag)}
                      </span>
                    )}
                    {product.isOnSale && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        Oferta
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => removeFromFavorites(product.id)}
                      className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-110 transition-all duration-200"
                      title="Remover de favoritos"
                    >
                      <Trash2 size={16} />
                    </button>
                    <Link
                      href={`/productos/${product.id}`}
                      className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:text-primary-600 hover:scale-110 transition-all duration-200"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>

                  {/* Quick Add to Cart */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full btn-primary text-sm flex items-center justify-center"
                      disabled={!product.isAvailable}
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      {product.isAvailable ? 'Agregar al Carrito' : 'Sin Stock'}
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted uppercase tracking-wide">
                      {product.category}
                    </span>
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price}
                      </span>
                      {product.isOnSale && product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Stock: {product.calculatedStock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-red-700 mb-6" />
            <h2 className="text-xl font-semibold text-white mb-4">
              No tienes favoritos aún
            </h2>
            <p className="text-white mb-8">
              Explora nuestros productos y agrega los que más te gusten a tus favoritos
            </p>
            <Link href="/productos" className="btn-primary">
              Explorar Productos
            </Link>
          </div>
        )}

        {/* CTA para seguir comprando */}
        {favorites.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/productos" className="btn-secondary">
              Seguir Explorando
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}