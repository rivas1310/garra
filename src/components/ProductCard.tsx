'use client'

import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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
  calculatedStock?: number
  isAvailable?: boolean
  isActive?: boolean
  discount?: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  category?: string
  conditionTag?: string
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
  subcategoria?: string
}

function ProductCardContent({ product, layout = 'grid', subcategoria }: ProductCardProps) {
  const { addToCart, getItemQuantity, canAddMore } = useCart()
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [productData, setProductData] = useState<Product>(product)

  // Función para actualizar la información del producto desde el servidor
  const refreshProductData = async () => {
    try {
      // Agregar timestamp para evitar caché
      const timestamp = Date.now();
      const response = await fetch(`/api/productos/${product.id}?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      if (response.ok) {
        const data = await response.json();
        log.error(`ProductCard: Actualizando datos de producto ${product.id}, stock: ${data.stock}`);
        setProductData({
          ...product,
          stock: data.stock,
          calculatedStock: data.calculatedStock || data.stock,
          isAvailable: data.isAvailable,
          isActive: data.isActive,
          variants: data.variants || product.variants
        });
      }
    } catch (error) {
      log.error('Error al actualizar datos del producto:', error);
    }
  };

  // Actualizar datos del producto cuando se muestra el componente
  useEffect(() => {
    refreshProductData();
  }, [product.id]);

  // Crear URL con estado de navegación
  const createProductUrl = () => {
    const baseUrl = `/productos/${product.id}`
    const params = new URLSearchParams()
    
    // Si estamos en una página de categoría, guardar la información
    if (pathname?.includes('/categorias/')) {
      params.set('from', 'category')
      params.set('category', pathname.split('/categorias/')[1])
      
      // Agregar subcategoría si existe
      if (subcategoria) {
        params.set('subcat', subcategoria)
      }
      
      // Preservar parámetros de búsqueda si existen
      if (searchParams?.get('page')) {
        params.set('page', searchParams.get('page')!)
      }
      if (searchParams?.get('sort')) {
        params.set('sort', searchParams.get('sort')!)
      }
      if (searchParams?.get('filter')) {
        params.set('filter', searchParams.get('filter')!)
      }
    }
    
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
  }

  // Verificar disponibilidad del producto
  const isAvailable = productData.isAvailable !== false && (productData.calculatedStock || 0) > 0 && productData.isActive !== false
  const stock = productData.calculatedStock || productData.stock || 0
  const isLowStock = stock > 0 && stock <= 5
  const isOutOfStock = stock === 0
  
  // Obtener cantidad actual en el carrito
  const currentCartQuantity = getItemQuantity(product.id)
  // Calcular el stock real disponible (calculatedStock - cantidad en carrito)
  const realAvailableStock = Math.max(0, stock - currentCartQuantity)
  const canAddMoreToCart = canAddMore(product.id, stock)
  
  // Extraer tallas y colores únicos de las variantes
  const availableSizes = productData.variants && productData.variants.length > 0
    ? Array.from(new Set(productData.variants.map(v => v.size).filter(Boolean))) as string[]
    : []
    
  const availableColors = productData.variants && productData.variants.length > 0
    ? Array.from(new Set(productData.variants.map(v => v.color).filter(Boolean))) as string[]
    : []

  const handleAddToCart = async () => {
    // Actualizar datos del producto antes de agregar al carrito
    await refreshProductData();
    
    // Verificar disponibilidad con los datos más recientes
    if (!productData.isAvailable || (productData.calculatedStock || 0) <= 0 || productData.isActive === false) {
      toast.error('Producto no disponible')
      return
    }
    
    // Verificar si hay stock real disponible (considerando lo que ya está en el carrito)
    if (realAvailableStock <= 0) {
      toast.error('No hay más unidades disponibles')
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
    
    // Usar productData en lugar de product para asegurar datos actualizados
    // Agregar todas las unidades disponibles de una vez
    addToCart({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      image: productData.image,
      stock: productData.calculatedStock || productData.stock || stock,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    }).then((result) => {
      if (result.success) {
        toast.success(result.message)
        // Actualizar datos del producto después de agregar al carrito
        setTimeout(() => refreshProductData(), 500); // Pequeño retraso para permitir que la BD se actualice
      } else {
        toast.error(result.message)
      }
    }).catch((error) => {
      log.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar al carrito')
    }).finally(() => {
      // Resetear el estado después de un breve delay
      setTimeout(() => setIsAddingToCart(false), 300)
    })
  }

  // Verificar si el producto está en favoritos
  useEffect(() => {
    if (session?.user) {
      checkFavoriteStatus()
    }
  }, [session, productData.id])

  const checkFavoriteStatus = async () => {
    try {
      // Agregar timestamp para evitar caché
      const timestamp = Date.now();
      const response = await fetch(`/api/favoritos?t=${timestamp}`, {
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
      if (response.ok) {
        const favorites = await response.json()
        const isInFavorites = favorites.some((fav: any) => fav.id === productData.id)
        setIsFavorite(isInFavorites)
      }
    } catch (error) {
      log.error('Error al verificar favoritos:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para agregar favoritos')
      return
    }

    try {
      // Asegurar que tenemos la información más actualizada
      await refreshProductData();
      
      if (isFavorite) {
        // Remover de favoritos
        const timestamp = Date.now();
        const response = await fetch(`/api/favoritos/${productData.id}?t=${timestamp}`, {
          method: 'DELETE',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })
        
        if (response.ok) {
          setIsFavorite(false)
          toast.success('Eliminado de favoritos')
        } else {
          toast.error('Error al eliminar de favoritos')
        }
      } else {
        // Agregar a favoritos
        const timestamp = Date.now();
        const response = await fetch(`/api/favoritos?t=${timestamp}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          body: JSON.stringify({ productId: productData.id }),
        })
        
        if (response.ok) {
          setIsFavorite(true)
          toast.success('Agregado a favoritos')
        } else {
          toast.error('Error al agregar a favoritos')
        }
      }
    } catch (error) {
      log.error('Error al manejar favoritos:', error)
      toast.error('Error al manejar favoritos')
    }
  }

  const getStockStatus = () => {
    // Si no hay stock disponible en total
    if (isOutOfStock) {
      return {
        text: 'Sin stock',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    }
    
    // Si hay productos en el carrito
    if (currentCartQuantity > 0) {
      // Si ya no se pueden agregar más (todo el stock está en el carrito)
      if (realAvailableStock <= 0) {
        return {
          text: `${currentCartQuantity} en carrito (máximo)`,
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          icon: <AlertTriangle className="h-4 w-4" />
        }
      }
      // Si queda poco stock disponible
      if (realAvailableStock <= 5) {
        return {
          text: `${currentCartQuantity} en carrito, ${realAvailableStock} disponibles`,
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          icon: <AlertTriangle className="h-4 w-4" />
        }
      }
      // Si hay suficiente stock disponible
      return {
        text: `${currentCartQuantity} en carrito, ${realAvailableStock} disponibles`,
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <Package className="h-4 w-4" />
      }
    }
    
    // Si no hay productos en el carrito pero el stock es bajo
    if (isLowStock) {
      return {
        text: `Solo ${stock} disponibles`,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    }
    
    // Stock normal sin productos en el carrito
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
        {/* Product Image with Link */}
        <Link href={createProductUrl()} className="relative w-32 h-32 flex-shrink-0 block">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
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
        </Link>

        {/* Product Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
            <span className="text-xs text-muted uppercase tracking-wide">
              {product.category}
            </span>
            <Link href={createProductUrl()} className="block">
              <h3 className="font-semibold text-title mt-1 mb-2 hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center mb-2">
              <Star size={14} className="text-yellow-400 fill-current" />
              <span className="text-sm text-body ml-1">
                {product.rating} ({product.reviewCount} reseñas)
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
                href={createProductUrl()}
                className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Eye size={16} />
              </Link>
            </div>
          </div>

          {/* Ver Producto Button */}
          <Link
            href={createProductUrl()}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium btn-primary transition-colors"
          >
            <Eye size={16} className="mr-2" />
            Ver Producto
          </Link>
        </div>
      </div>
    )
  }

  // Grid view (default)
  return (
    <div className="group card overflow-hidden">
      {/* Product Image with Link */}
      <Link href={createProductUrl()} className="block relative h-64 overflow-hidden">
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

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite();
            }}
            className={`p-2 rounded-full ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 hover:text-red-500'
            } shadow-lg hover:scale-110 transition-all duration-200`}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Ver Producto Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Eye size={16} />
            Ver Producto
          </div>
        </div>
      </Link>

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

        <Link href={createProductUrl()} className="block">
          <h3 className="font-semibold text-title mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

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

export default function ProductCard({ product, layout = 'grid', subcategoria }: ProductCardProps) {
  return (
    <ClientOnly>
      <ProductCardContent product={product} layout={layout} subcategoria={subcategoria} />
    </ClientOnly>
  )
}