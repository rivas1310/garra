'use client'

// Página de administración de productos con paginación optimizada - v4.2
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { log } from '@/lib/secureLogger'
import { normalizeText } from '@/utils/searchUtils'

const categories = [
  { id: 'all', name: 'Todas' },
  { id: 'mujer', name: 'Mujer' },
  { id: 'hombre', name: 'Hombre' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'calzado', name: 'Calzado' },
  { id: 'bolsos', name: 'Bolsos' },
  { id: 'deportes', name: 'Deportes' }
]

export default function ProductosAdminPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: ''
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Debug: Verificar estado del modal
  console.log('Estado del modal:', showImageModal, 'Imagen seleccionada:', selectedImage);

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  // Función para cargar productos
  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        admin: 'true',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
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

      setProducts(data.productos || []);
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
    fetchProducts(1);
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    // Siempre recargar cuando cambien los filtros, independientemente si hay productos o no
    fetchProducts(1);
  }, [selectedCategory, searchTerm]);

  // Mapeo de productos para asegurar que stock sea numérico y status correcto
  const mappedProducts = products.map((p: any) => {
    const stock = Number(p.stock);
    let status;
    
    // Primero verificar si el producto está activo
    if (p.isActive === false) {
      status = 'inactive';
    } else {
      // Si está activo, determinar el estado basado en el stock
      status = stock === 0 ? 'out-of-stock' : stock < 5 ? 'low-stock' : 'active';
    }
    
      return {
    ...p,
    stock,
    status,
  };
  });

  const filteredProducts = mappedProducts.filter(product => {
    // Filtrar por estado activo/inactivo
    if (!showInactive && product.status === 'inactive') {
      return false;
    }
    
    return true;
  });

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch('/api/productos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Producto eliminado correctamente');
        setDeleteModal({ isOpen: false, productId: null, productName: '' });
        fetchProducts(currentPage); // Recargar productos
      } else if (response.status === 409) {
        // Producto asociado a órdenes, mostrar mensaje específico
        toast.error(`${data.error}. ${data.detalle}`);
      } else {
        toast.error(data.error || 'Error al eliminar el producto');
      }
    } catch (error) {
      toast.error('Error al eliminar el producto');
      log.error('Error deleting product:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Activo</span>;
      case 'low-stock':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Stock Bajo</span>;
      case 'out-of-stock':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Sin Stock</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactivo</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Desconocido</span>;
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= (pagination?.totalPages || 1)) {
      fetchProducts(pageNum);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar productos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchProducts(1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administrar Productos</h1>
              <p className="mt-2 text-gray-600">
                {pagination ? `${pagination.total} productos en total` : 'Cargando productos...'}
              </p>
            </div>
            
            <button
              onClick={() => router.push('/admin/productos/nuevo')}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Producto
              </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
             <p className="text-gray-600">Administra tu catálogo de productos</p>
           </div>

          {/* Filtros y controles */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
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

            {/* Controles adicionales */}
            <div className="flex items-center space-x-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos (ignora acentos y mayúsculas)..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <div className="absolute -bottom-6 left-0 text-xs text-blue-500">
                    🔍 Búsqueda inteligente activa
                  </div>
                )}
              </div>

              {/* Mostrar inactivos */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Mostrar inactivos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Estado de carga */}
        {loading && currentPage === 1 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando productos...</span>
              </div>
        )}

        {/* Tabla de productos */}
        {!loading && filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600">Intenta ajustar los filtros o la búsqueda</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="px-6 py-8">
                      <div className="flex items-center">
                            <div className="h-32 w-32 flex-shrink-0 relative group">
                        <img
                                className="h-32 w-32 rounded-xl object-cover border-2 border-gray-200 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300"
                          src={Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png'}
                          alt={product.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/img/placeholder.png';
                          }}
                        />
                        {/* Overlay con icono de zoom - ahora clickeable */}
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('=== CLICK EN OVERLAY ===');
                            const imageUrl = Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png';
                            console.log('URL de imagen:', imageUrl);
                            console.log('Estado ANTES del click - Modal:', showImageModal, 'Imagen:', selectedImage);
                            setSelectedImage(imageUrl);
                            setShowImageModal(true);
                            console.log('Comandos ejecutados - setSelectedImage y setShowImageModal(true)');
                            // Verificar después de un pequeño delay
                            setTimeout(() => {
                              console.log('Estado DESPUÉS del click (con delay) - Modal:', showImageModal, 'Imagen:', selectedImage);
                            }, 100);
                          }}
                        >
                          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center pointer-events-none">
                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                            <span className="text-xs font-medium">Ver imagen</span>
                          </div>
                        </div>
                            </div>
                        <div className="ml-6">
                              <div className="text-sm font-semibold text-gray-900 mb-1 max-w-xs truncate">{product.name}</div>
                              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">ID: {product.id}</div>
                            </div>
                      </div>
                    </td>
                        <td className="px-6 py-8 text-sm text-gray-900 align-middle">
                          <div className="font-medium">{product.category?.name || 'Sin categoría'}</div>
                    </td>
                        <td className="px-6 py-8 text-sm text-gray-900 align-middle">
                          <div className="font-semibold text-green-600">${product.price}</div>
                      {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-xs text-gray-500 line-through">
                              ${product.originalPrice}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-8 text-sm text-gray-900 align-middle">
                          <div className="font-medium">{product.stock}</div>
                          {product.variants && product.variants.length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              {product.variants.length} variantes
                            </div>
                      )}
                    </td>
                    <td className="px-6 py-8 align-middle">
                          {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-8 text-sm font-medium align-middle">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => router.push(`/admin/productos/${product.id}/editar`)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                              title="Editar producto"
                        >
                          <Edit className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </button>
                        <button
                              onClick={() => setDeleteModal({
                                isOpen: true,
                                productId: product.id,
                                productName: product.name
                              })}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                              title="Eliminar producto"
                        >
                          <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </div>

            {/* Paginación simple */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
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
                  Mostrando {((currentPage - 1) * 25) + 1} - {Math.min(currentPage * 25, pagination.total)} 
                  de {pagination.total} productos
                </div>
            </div>
            )}
          </>
        )}
          </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Confirmar eliminación</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar el producto "{deleteModal.productName}"?
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteModal.productId && handleDelete(deleteModal.productId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen ampliada */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center cursor-pointer"
          style={{
            zIndex: 99999,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh'
          }}
          onClick={() => {
            console.log('Fondo clickeado - cerrando modal');
            setShowImageModal(false);
          }}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            {/* Botón de cerrar */}
            <button
              onClick={() => {
                console.log('Botón X clickeado - cerrando modal');
                setShowImageModal(false);
              }}
              className="absolute -top-12 right-0 text-white bg-red-600 hover:bg-red-700 rounded-full p-3 transition-all duration-200 shadow-lg z-10"
              style={{ zIndex: 100000 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Imagen */}
            <img
              src={selectedImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default"
              style={{
                maxWidth: '95vw',
                maxHeight: '95vh',
                display: 'block'
              }}
              onContextMenu={(e) => {
                // Permitir click derecho para copiar imagen
                e.stopPropagation();
              }}
              draggable={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}