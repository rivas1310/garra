'use client'

// Página de productos con paginación optimizada - v4.1
import { useState, useEffect } from 'react'
import { Grid, List, Loader2 } from 'lucide-react'
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  // Función para cargar productos
  const fetchProducts = async (page: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        ...(sortBy !== 'featured' && { sort: sortBy === 'featured' ? 'newest' : sortBy }),
        t: Date.now().toString(),
      });

      const response = await fetch(`/api/productos?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (reset) {
        setProducts(data.productos || []);
      } else {
        setProducts(prev => [...prev, ...(data.productos || [])]);
      }
      
      setPagination(data.pagination);
      setCurrentPage(page);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos iniciales
  useEffect(() => {
    fetchProducts(1, true);
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (products.length > 0) {
      fetchProducts(1, true);
    }
  }, [selectedCategory, searchTerm, sortBy]);

  // Mapear productos para compatibilidad
  const mappedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/img/placeholder.png',
    rating: 0,
    reviews: 0,
    category: p.category?.name ?? '',
    isNew: p.isNew,
    isOnSale: p.isOnSale,
    isSecondHand: p.isSecondHand,
    stock: p.stock ?? 0,
    isActive: p.isActive ?? true,
    isAvailable: true,
    totalStock: p.totalStock ?? p.stock ?? 0,
    variants: p.variants ?? [],
  }));

  const filteredProducts = mappedProducts.filter(product => {
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    return true;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= (pagination?.totalPages || 1)) {
      fetchProducts(pageNum, true);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar productos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchProducts(1, true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
              <p className="mt-2 text-gray-600">
                {pagination ? `${pagination.total} productos encontrados` : 'Cargando productos...'}
              </p>
            </div>
            
            {/* Barra de búsqueda */}
            <div className="mt-4 sm:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y controles */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          {/* Categorías */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Controles de vista y ordenamiento */}
          <div className="flex items-center space-x-4">
            {/* Ordenamiento */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="featured">Destacados</option>
              <option value="newest">Más recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>

            {/* Modo de vista */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Rango de precios */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de precios: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
              className="flex-1"
            />
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="flex-1"
            />
          </div>
        </div>

        {/* Estado de carga */}
        {loading && currentPage === 1 && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-2 text-gray-600">Cargando productos...</span>
          </div>
        )}

        {/* Productos */}
        {!loading && filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600">Intenta ajustar los filtros o la búsqueda</p>
          </div>
        ) : (
          <>
            {/* Grid de productos */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Paginación simple */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12">
                <div className="flex justify-center space-x-2 mb-4">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  
                  <span className="px-4 py-2 text-gray-700">
                    Página {currentPage} de {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
                
                {/* Información de paginación */}
                <div className="text-center text-sm text-gray-600">
                  Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, pagination.total)} 
                  de {pagination.total} productos
                </div>
              </div>
            )}

            {/* Botón de cargar más */}
            {pagination?.hasNextPage && (
              <div className="text-center mt-8">
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 inline mr-2" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más productos'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}