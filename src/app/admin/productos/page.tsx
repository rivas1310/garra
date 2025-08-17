'use client'

import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'

// Eliminar el array products simulado

const categories = [
  { id: 'all', name: 'Todas las categorías' },
  { id: 'mujer', name: 'Mujer' },
  { id: 'hombre', name: 'Hombre' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'calzado', name: 'Calzado' },
  { id: 'bolsos', name: 'Bolsos' },
  { id: 'deportes', name: 'Deportes' }
]

export default function ProductosAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: ''
  });

  useEffect(() => {
    // Agregar timestamp para evitar caché
    const timestamp = Date.now();
    log.error('Cargando productos con timestamp:', timestamp);
    fetch(`/api/productos?admin=true&limit=1000&t=${timestamp}`)
      .then(res => res.json())
      .then(data => {
        log.error('Datos recibidos de la API:', data);
        log.error('Tipo de datos:', typeof data);
        log.error('Es array:', Array.isArray(data));
        if (Array.isArray(data)) {
          log.error('Usando datos como array, longitud:', data.length);
          setProducts(data);
        } else if (data.productos && Array.isArray(data.productos)) {
          log.error('Usando data.productos, longitud:', data.productos.length);
          setProducts(data.productos);
        } else if (data.products && Array.isArray(data.products)) {
          log.error('Usando data.products, longitud:', data.products.length);
          setProducts(data.products);
        } else {
          log.error('Formato de datos no reconocido:', data);
          setProducts([]);
        }
      })
      .catch(error => {
        log.error('Error al cargar productos:', error);
        toast.error('Error al cargar productos');
      });
  }, []);

  // Mapeo de productos para asegurar que stock sea numérico y status correcto
  log.error('Productos antes del mapeo:', products);
  const mappedProducts = Array.isArray(products) ? products.map((p: any) => {
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
  }) : [];
  log.error('Productos después del mapeo:', mappedProducts);

  const filteredProducts = mappedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || (product.category?.name?.toLowerCase?.() === selectedCategory)
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })
  log.error('Productos filtrados:', filteredProducts);
  log.error('Filtros aplicados', { searchTerm, selectedCategory, selectedStatus });

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch('/api/productos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      });
      const data = await res.json();
      
      if (data.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('Producto eliminado');
      } else if (res.status === 409) {
        // Producto asociado a órdenes, ofrecer desactivarlo en lugar de eliminarlo
        if (confirm(`${data.error}. ${data.detalle}\n\n¿Desea desactivar el producto en su lugar?`)) {
          await handleDeactivateProduct(productId);
        }
      } else {
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const openDeleteModal = (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      productId: null,
      productName: ''
    });
  };

  const handleDeactivateProduct = async (productId: string) => {
    try {
      const res = await fetch('/api/productos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, isActive: false }),
      });
      const data = await res.json();
      
      if (data.ok) {
        // Actualizar el producto en la lista local
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, isActive: false } : p
        ));
        toast.success('Producto desactivado correctamente');
      } else {
        toast.error(data.error || 'Error al desactivar el producto');
      }
    } catch (err) {
      toast.error('Error al desactivar el producto');
    }
  };

  const handleBulkAction = (action: string) => {
    toast.success(`Acción ${action} aplicada a los productos seleccionados`)
  }

  // Exportar productos a CSV
  const handleExport = () => {
    const csvRows = [
      ['ID', 'Nombre', 'Categoría', 'Precio', 'Stock'],
      ...products.map(p => [
        p.id,
        p.name,
        p.category?.name || '',
        p.price,
        p.stock
      ])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Productos exportados como CSV');
  };

  // Importar productos desde CSV y guardar en la base de datos
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(1); // Saltar encabezado
      let success = 0;
      let fail = 0;
      for (const line of lines) {
        const [id, name, category, price, stock] = line.split(',');
        if (!name) continue;
        try {
          await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              description: '',
              categoryId: category,
              price,
              stock,
              images: [],
              isActive: true,
              isNew: false,
              isOnSale: false,
              isSecondHand: false,
              variants: [],
            }),
          });
          success++;
        } catch {
          fail++;
        }
      }
      toast.success(`Importación completada: ${success} productos importados, ${fail} fallidos`);
      // Refrescar productos con timestamp para evitar caché
      const timestamp = Date.now();
      fetch(`/api/productos?t=${timestamp}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProducts(data);
          } else if (Array.isArray(data.products)) {
            setProducts(data.products);
          } else {
            setProducts([]);
          }
        });
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-700">Gestión de Productos</h1>
              <p className="text-sm sm:text-base text-neutral-600">Administra tu catálogo de productos</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button className="btn-secondary inline-flex items-center text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3" onClick={handleExport} type="button">
                <Download className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Exportar
              </button>
              <label className="btn-secondary inline-flex items-center cursor-pointer text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3">
                <Upload className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Importar
                <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
              </label>
              <Link href="/admin/productos/nuevo" className="btn-primary inline-flex items-center text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3">
                <Plus className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Nuevo Producto
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">En Stock</option>
              <option value="low-stock">Stock Bajo</option>
              <option value="out-of-stock">Sin Stock</option>
              <option value="inactive">Inactivo</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="stock">Ordenar por stock</option>
              <option value="date">Ordenar por fecha</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-neutral-700">
                  Productos ({filteredProducts.length})
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500">Gestiona tu inventario</p>
              </div>
              <button className="btn-secondary inline-flex items-center text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3 self-start sm:self-auto">
                <RefreshCw className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Actualizar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                    Categoría
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                    Stock
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png'}
                          alt={product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-700">{product.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {product.isNew && (
                              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                                Nuevo
                              </span>
                            )}
                            {product.isOnSale && (
                              <span className="text-xs bg-accent-100 text-accent-800 px-2 py-1 rounded-full">
                                Oferta
                              </span>
                            )}
                            {product.isSecondHand && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Segunda mano
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-600">{product.category?.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-700 font-medium">${product.price}</div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-xs text-neutral-500 line-through">${product.originalPrice}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-600">{product.stock} unidades</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                        product.status === 'inactive' ? 'bg-neutral-100 text-neutral-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.status === 'active' ? 'En Stock' :
                         product.status === 'low-stock' ? 'Stock Bajo' :
                         product.status === 'inactive' ? 'Inactivo' :
                         'Sin Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/productos/${product.id}/editar`}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(product.id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Mostrando 1-{filteredProducts.length} de {filteredProducts.length} productos
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm border border-neutral-200 rounded hover:bg-neutral-50">
                  Anterior
                </button>
                <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm border border-neutral-200 rounded hover:bg-neutral-50">
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (deleteModal.productId) {
            handleDeleteProduct(deleteModal.productId);
          }
        }}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        itemName={deleteModal.productName}
      />
    </div>
  )
}