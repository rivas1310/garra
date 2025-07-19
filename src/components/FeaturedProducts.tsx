'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

const featuredProducts = [
  {
    id: '1',
    name: 'Vestido Floral de Verano',
    price: 89.99,
    originalPrice: 120.00,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2028&q=80',
    rating: 4.8,
    reviews: 124,
    category: 'Mujer',
    isNew: true,
    isOnSale: true
  },
  {
    id: '2',
    name: 'Camisa de Lino Clásica',
    price: 65.00,
    originalPrice: 85.00,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80',
    rating: 4.6,
    reviews: 89,
    category: 'Hombre',
    isNew: false,
    isOnSale: true
  },
  {
    id: '3',
    name: 'Jeans Slim Fit Premium',
    price: 95.00,
    originalPrice: 95.00,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80',
    rating: 4.9,
    reviews: 203,
    category: 'Hombre',
    isNew: true,
    isOnSale: false
  },
  {
    id: '4',
    name: 'Blazer Elegante Negro',
    price: 145.00,
    originalPrice: 180.00,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    rating: 4.7,
    reviews: 156,
    category: 'Mujer',
    isNew: false,
    isOnSale: true
  },
  {
    id: '5',
    name: 'Sneakers Urbanos',
    price: 75.00,
    originalPrice: 95.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2012&q=80',
    rating: 4.5,
    reviews: 98,
    category: 'Calzado',
    isNew: false,
    isOnSale: true
  },
  {
    id: '6',
    name: 'Bolso Tote Minimalista',
    price: 55.00,
    originalPrice: 55.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    rating: 4.4,
    reviews: 67,
    category: 'Accesorios',
    isNew: true,
    isOnSale: false
  },
  {
    id: '7',
    name: 'Reloj Elegante Dorado',
    price: 120.00,
    originalPrice: 150.00,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
    rating: 4.8,
    reviews: 134,
    category: 'Accesorios',
    isNew: false,
    isOnSale: true
  },
  {
    id: '8',
    name: 'Chaqueta Deportiva',
    price: 85.00,
    originalPrice: 110.00,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    rating: 4.6,
    reviews: 87,
    category: 'Deportes',
    isNew: false,
    isOnSale: true
  }
]

export default function FeaturedProducts() {
  const { addToCart } = useCart()
  const [favorites, setFavorites] = useState<string[]>([])

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    toast.success('Producto agregado al carrito')
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Productos Destacados
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Descubre nuestras mejores ofertas y productos más populares.
          </p>
          <p className="text-base text-primary-700 max-w-2xl mx-auto">
            ♻️ Cada prenda tiene una segunda oportunidad. Al elegir Garra Felina, apoyas la moda sostenible y el consumo responsable.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group card overflow-hidden">
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Nuevo
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
                    onClick={() => toggleFavorite(product.id)}
                    className={`p-2 rounded-full ${
                      favorites.includes(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-primary-700 hover:text-red-500'
                    } shadow-lg hover:scale-110 transition-all duration-200`}
                  >
                    <Heart size={16} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} />
                  </button>
                  <Link
                    href={`/productos/${product.id}`}
                    className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:text-primary-600 hover:scale-110 transition-all duration-200"
                  >
                    <Eye size={16} />
                  </Link>
                </div>

                {/* Quick Add to Cart */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full btn-primary text-sm flex items-center justify-center"
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Agregar al Carrito
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
                      {product.rating} ({product.reviews})
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
                    {product.isOnSale && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/productos"
            className="btn-primary inline-flex items-center group"
          >
            Ver Todos los Productos
            <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
} 