'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import ProductCard from './ProductCard'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const { addToCart } = useCart();

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = async (product: any) => {
    try {
      const result = await addToCart(product);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error al agregar al carrito');
    }
  };

  useEffect(() => {
    console.log('🚀 FeaturedProducts: Iniciando carga de productos...');
    // Obtener productos destacados de la API con timestamp para evitar caché
    const timestamp = Date.now();
    fetch(`/api/productos?t=${timestamp}&limit=50`)
      .then(res => {
        console.log('📡 Respuesta de la API:', res.status, res.statusText);
        return res.json();
      })
                      .then(data => {
          console.log('📦 Datos recibidos de la API:', data);
          console.log('📦 Tipo de datos:', typeof data);
          console.log('📦 ¿Es array?', Array.isArray(data));
          console.log('📦 Longitud de datos:', Array.isArray(data) ? data.length : 'No es array');
          
          // Extraer los productos de la respuesta (puede ser un array directo o un objeto con productos)
          let productos = data;
          if (data && typeof data === 'object' && !Array.isArray(data) && data.productos) {
            productos = data.productos;
            console.log('📦 Datos extraídos de data.productos:', productos);
          }
          
          // Mapear los productos para el formato que necesita ProductCard
          console.log('🔍 Datos originales de productos:', productos);
          if (Array.isArray(productos) && productos.length > 0) {
            console.log('🔍 Primer producto:', productos[0]);
            console.log('🔍 Propiedades del primer producto:', Object.keys(productos[0]));
          }
          
          const mappedProducts = Array.isArray(productos) ? productos.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/img/placeholder.png',
          rating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? 0,
          category: p.category?.name ?? '',
          isNew: p.isNew,
          isSale: p.isOnSale,
          isSecondHand: p.isSecondHand,
          stock: p.stock ?? 0,
          isActive: p.isActive ?? true,
          isAvailable: p.isAvailable ?? true,
          totalStock: p.totalStock ?? p.stock ?? 0,
          variants: p.variants ?? [], // Incluir las variantes del producto
        })) : [];
        
        // Filtrar solo productos destacados (por ejemplo, los que están en oferta o son nuevos)
        console.log('🔍 Filtrando productos destacados...');
        console.log('🔍 Productos con isNew=true:', mappedProducts.filter(p => p.isNew).length);
        console.log('🔍 Productos con isSale=true:', mappedProducts.filter(p => p.isSale).length);
        
        let featured = mappedProducts.filter(p => p.isNew || p.isSale).slice(0, 8);
        
        // Si no hay productos destacados, mostrar los primeros 8 productos
        if (featured.length === 0) {
          featured = mappedProducts.slice(0, 8);
        }
        
        console.log('📦 Productos mapeados:', mappedProducts.length);
        console.log('📦 Productos destacados encontrados:', featured.length);
        console.log('📦 Productos destacados:', featured);
        setProducts(featured);
        setLoading(false);
      })
      .catch(error => {
        console.error('❌ Error al cargar productos destacados:', error);
        setLoading(false);
      });
  }, []);

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
            ♻️ Cada prenda tiene una segunda oportunidad. Al elegir Garras Felinas, apoyas la moda sostenible y el consumo responsable.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Cargando productos destacados...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay productos destacados disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
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
                  {product.isSale && (
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
                    {product.isSale && (
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
        )}

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