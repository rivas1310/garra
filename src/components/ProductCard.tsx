'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, Eye, Star, Package, AlertTriangle } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import ClientOnly from './ClientOnly'

interface Product {
  id: string
  name: string
  price: number
  image: string
  stock?: number
  totalStock?: number
  isAvailable?: boolean
  isActive?: boolean
  discount?: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  category?: string
  isNew?: boolean
  isSale?: boolean
  isSecondHand?: boolean
  variants?: Array<{
    size?: string
    color?: string
    stock?: number
  }>
}

interface ProductCardProps {
  product: Product
  layout?: 'grid' | 'list'
}

function ProductCardContent({ product, layout = 'grid' }: ProductCardProps) {
  const { addToCart, getItemQuantity, canAddMore } = useCart()
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // Verificar disponibilidad del producto
  const isAvailable = product.isAvailable !== false && (product.stock || 0) > 0 && product.isActive !== false
  const stock = product.totalStock || product.stock || 0
  const isLowStock = stock > 0 && stock <= 5
  const isOutOfStock = stock === 0
  
  // Obtener cantidad actual en el carrito
  const currentCartQuantity = getItemQuantity(product.id)
  const canAddMoreToCart = canAddMore(product.id, stock)
  
  // Extraer tallas y colores únicos de las variantes
  const availableSizes = product.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.map(v => v.size).filter(Boolean))) as string[]
    : []
    
  const availableColors = product.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))) as string[]
    : []

  const handleAddToCart = async () => {
    if (!isAvailable) {
      toast.error('Producto no disponible')
      return
    }
    
    // Verificar si hay variantes disponibles y si se seleccionó talla/color
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error('Por favor selecciona una talla')
      return
    }
    
    if (availableColors.length > 0 && !selectedColor) {
      toast.error('Por favor selecciona un color')
      return
    }
    
    setIsAddingToCart(true)
    
    const result = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: stock,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    })
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    
    // Resetear el estado después de un breve delay
    setTimeout(() => setIsAddingToCart(false), 300)
  }

  // Verificar si el producto está en favoritos
  useEffect(() => {
    if (session?.user) {
      checkFavoriteStatus()
    }
  }, [session, product.id])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/favoritos')
      if (response.ok) {
        const favorites = await response.json()
        const isInFavorites = favorites.some((fav: any) => fav.id === product.id)
        setIsFavorite(isInFavorites)
      }
    } catch (error) {
      console.error('Error al verificar favoritos:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para agregar favoritos')
      return
    }

    try {
      if (isFavorite) {
        // Remover de favoritos
        const response = await fetch(`/api/favoritos/${product.id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setIsFavorite(false)
          toast.success('Eliminado de favoritos')
        } else {
          toast.error('Error al eliminar de favoritos')
        }
      } else {
        // Agregar a favoritos
        const response = await fetch('/api/favoritos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product.id }),
        })
        
        if (response.ok) {
          setIsFavorite(true)
          toast.success('Agregado a favoritos')
        } else {
          toast.error('Error al agregar a favoritos')
        }
      }
    } catch (error) {
      console.error('Error al manejar favoritos:', error)
      toast.error('Error al manejar favoritos')
    }
  }

  const getStockStatus = () => {
    if (isOutOfStock) {
      return {
        text: 'Sin stock',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    }
    
    if (currentCartQuantity > 0) {
      const remainingStock = stock - currentCartQuantity
      if (remainingStock <= 0) {
        return {
          text: `${currentCartQuantity} en carrito (máximo)`,
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          icon: <AlertTriangle className="h-4 w-4" />
        }
      }
      if (isLowStock || remainingStock <= 5) {
        return {
          text: `${currentCartQuantity} en carrito, ${remainingStock} disponibles`,
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          icon: <AlertTriangle className="h-4 w-4" />
        }
      }
      return {
        text: `${currentCartQuantity} en carrito, ${remainingStock} disponibles`,
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <Package className="h-4 w-4" />
      }
    }
    
    if (isLowStock) {
      return {
        text: `Solo ${stock} disponibles`,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    }
    return {
      text: `${stock} disponibles`,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: <Package className="h-4 w-4" />
    }
  }

  const stockStatus = getStockStatus()

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 border border-primary-100">
        {/* Product Image */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/img/placeholder.png'; }}
          />
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Nuevo
            </span>
          )}
          {product.isSale && (
            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              Oferta
            </span>
          )}
          {product.isSecondHand && (
            <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              Segunda mano
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
            <span className="text-xs text-muted uppercase tracking-wide">
              {product.category}
            </span>
            <h3 className="font-semibold text-title mt-1 mb-2">
              {product.name}
            </h3>
            <div className="flex items-center mb-2">
              <Star size={14} className="text-yellow-400 fill-current" />
              <span className="text-sm text-body ml-1">
                {product.rating} ({product.reviewCount} reseñas)
              </span>
            </div>
            
            {/* Variantes disponibles - Vista de lista */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-2">
                {/* Colores disponibles */}
                {availableColors.length > 0 && (
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-muted">Colores:</span>
                    <div className="flex flex-wrap gap-1">
                      {availableColors.map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(color as string)}
                          className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${selectedColor === color 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tallas disponibles */}
                {availableSizes.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted">Tallas:</span>
                    <div className="flex flex-wrap gap-1">
                      {availableSizes.map((size, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSize(size as string)}
                          className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${selectedSize === size 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
              
            {/* Stock Status */}
            <div className={`flex items-center gap-2 mb-2 px-2 py-1 rounded-full ${stockStatus.bgColor}`}>
              {stockStatus.icon}
              <span className={`text-xs font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold text-title">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <Link
                href={`/productos/${product.id}`}
                className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Eye size={16} />
              </Link>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || !canAddMoreToCart || isAddingToCart}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isAvailable && canAddMoreToCart && !isAddingToCart
                ? 'btn-primary'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={16} className="mr-2" />
            {isAddingToCart ? 'Agregando...' : 
             !isAvailable ? 'No Disponible' : 
             !canAddMoreToCart ? 'Máximo alcanzado' : 
             currentCartQuantity > 0 ? `Agregar (${currentCartQuantity}/${stock})` : 
             'Agregar al Carrito'}
          </button>
        </div>
      </div>
    )
  }

  // Grid view (default)
  return (
    <div className="group card overflow-hidden">
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/img/placeholder.png'; }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Nuevo
            </span>
          )}
          {product.isSale && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              Oferta
            </span>
          )}
          {product.isSecondHand && (
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              Segunda mano
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stockStatus.bgColor}`}>
            {stockStatus.icon}
            <span className={`text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-12 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 hover:text-red-500'
            } shadow-lg hover:scale-110 transition-all duration-200`}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <Link
            href={`/productos/${product.id}`}
            className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:text-blue-600 hover:scale-110 transition-all duration-200"
          >
            <Eye size={16} />
          </Link>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || !canAddMoreToCart || isAddingToCart}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isAvailable && canAddMoreToCart && !isAddingToCart
                ? 'btn-primary'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={16} className="mr-2" />
            {isAddingToCart ? 'Agregando...' : 
             !isAvailable ? 'No Disponible' : 
             !canAddMoreToCart ? 'Máximo alcanzado' : 
             currentCartQuantity > 0 ? `Agregar (${currentCartQuantity}/${stock})` : 
             'Agregar al Carrito'}
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
            <span className="text-sm text-body ml-1">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-title mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Variantes disponibles */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-2">
            {/* Colores disponibles */}
            {availableColors.length > 0 && (
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-muted">Colores:</span>
                <div className="flex flex-wrap gap-1">
                  {availableColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color as string)}
                      className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${selectedColor === color 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tallas disponibles */}
            {availableSizes.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted">Tallas:</span>
                <div className="flex flex-wrap gap-1">
                  {availableSizes.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size as string)}
                      className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${selectedSize === size 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-title">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  return (
    <ClientOnly>
      <ProductCardContent product={product} layout={layout} />
    </ClientOnly>
  )
}