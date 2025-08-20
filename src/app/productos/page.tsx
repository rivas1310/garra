'use client'

import { useState, useEffect } from 'react'
import { Filter, Grid, List, Star } from 'lucide-react'
import ProductCard from '@/components/ProductCard'

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'mujer', name: 'Mujer' },
  { id: 'hombre', name: 'Hombre' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'calzado', name: 'Calzado' },
  { id: 'bolsos', name: 'Bolsos' },
  { id: 'deportes', name: 'Deportes' }
]

export default function ProductosPage() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    // Agregar timestamp para evitar caché
    const timestamp = Date.now();
    fetch(`/api/productos?t=${timestamp}`)
      .then(res => res.json())
      .then(data => {
        // Si la respuesta es un array, úsala directamente. Si es un objeto, busca la propiedad correcta.
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      });
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState([0, 500])
  const [sortBy, setSortBy] = useState('featured')

  const mappedProducts = Array.isArray(products) ? products.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/img/placeholder.png',
      rating: p.rating ?? 0,
      reviews: p.reviewCount ?? 0,
      category: p.category?.name ?? '',
      isNew: p.isNew,
      isOnSale: p.isOnSale,
      isSecondHand: p.isSecondHand,
      stock: p.stock ?? 0,
      isActive: p.isActive ?? true,
      isAvailable: p.isAvailable ?? true,
      totalStock: p.totalStock ?? p.stock ?? 0,
      variants: p.variants ?? [], // Incluir las variantes del producto
  })) : [];

  const filteredProducts = mappedProducts.filter(product => {
    if (selectedCategory !== 'all' && product.category.toLowerCase() !== selectedCategory) {
      return false
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-title mb-2">Productos</h1>
          <p className="text-body">Descubre nuestra colección completa</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 border border-primary-100">
              <h3 className="text-lg font-semibold text-title mb-4 flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filtros
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-title mb-3">Categorías</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-body">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-title mb-3">Rango de Precio</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-sm text-muted">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h4 className="font-medium text-title mb-3">Ordenar por</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-body"
                >
                  <option value="featured">Destacados</option>
                  <option value="price-low">Precio: Menor a Mayor</option>
                  <option value="price-high">Precio: Mayor a Menor</option>
                  <option value="newest">Más Recientes</option>
                  <option value="rating">Mejor Valorados</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setPriceRange([0, 500])
                  setSortBy('featured')
                }}
                className="w-full btn-secondary"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-body">
                Mostrando {filteredProducts.length} productos
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-200 text-primary-700 hover:bg-primary-300'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-200 text-primary-700 hover:bg-primary-300'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Products - Grid optimizado para tablet */}
            {filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-primary-400 mb-4">
                  <Filter size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-title mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-body">
                  Intenta ajustar los filtros para ver más resultados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}