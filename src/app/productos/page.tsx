'use client'

// Página de productos con filtrado local optimizado - v5.0 (main branch)
import { useState, useEffect, useMemo } from 'react'
import { Grid, List, Loader2, Search } from 'lucide-react'
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
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Función para cargar TODOS los productos una sola vez
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar todos los productos sin filtros
      const response = await fetch('/api/productos?limit=1000&t=' + Date.now());
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAllProducts(data.productos || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos una sola vez al montar el componente
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Filtrar productos localmente usando useMemo para optimización
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filtro por término de búsqueda (ignora acentos, mayúsculas, etc.)
    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      filtered = filtered.filter(p => {
        const normalizedName = p.name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
        const normalizedDesc = p.description?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
        const normalizedCategory = p.category?.name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
        
        return normalizedName.includes(normalizedSearch) ||
               normalizedDesc.includes(normalizedSearch) ||
               normalizedCategory.includes(normalizedSearch);
      });
    }

    // Filtro por rango de precio
    filtered = filtered.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Ordenamiento
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      default: // 'featured'
        // Mantener orden original
        break;
    }

    return filtered;
  }, [allProducts, selectedCategory, searchTerm, priceRange, sortBy]);

  // Calcular paginación del lado del cliente
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Resetear a la primera página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, priceRange, sortBy]);

  // Mapear productos para compatibilidad
  const mappedProducts = currentProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/img/placeholder.png',
    rating: 0,
    reviews: 0,
    category: p.category?.name ?? '',
    conditionTag: p.conditionTag,
    isOnSale: p.isOnSale,
    stock: p.stock ?? 0,
    isActive: p.isActive ?? true,
    isAvailable: p.stock > 0
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La búsqueda se actualiza automáticamente por el useMemo
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePriceRangeChange = (newRange: number[]) => {
    setPriceRange(newRange);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-lg text-neutral-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchAllProducts}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">Nuestros Productos</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Descubre nuestra colección de moda sostenible y accesible
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-elegant p-6 mb-8">
          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos por nombre, descripción o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de precio: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="featured">Destacados</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
                <option value="name">Nombre A-Z</option>
                <option value="newest">Más Nuevos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-neutral-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
          </p>
          
          {/* Cambiar vista */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Productos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-elegant p-8 text-center">
            <p className="text-neutral-500 mb-4">
              {searchTerm ? 'No se encontraron productos para tu búsqueda.' : 'No hay productos disponibles.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="btn-primary"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
                             {mappedProducts.map((product) => (
                 <ProductCard 
                   key={product.id} 
                   product={product} 
                   layout={viewMode}
                 />
               ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded-lg ${
                        page === currentPage
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}