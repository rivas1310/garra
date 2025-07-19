'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetch('/api/productos')
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
  }, []);

  // Mapeo de productos para asegurar que stock sea numérico y status correcto
  const mappedProducts = Array.isArray(products) ? products.map((p: any) => ({
    ...p,
    stock: Number(p.stock),
    status: Number(p.stock) === 0 ? 'out-of-stock' : Number(p.stock) < 5 ? 'low-stock' : 'active',
  })) : [];

  const filteredProducts = mappedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || (product.category?.name?.toLowerCase?.() === selectedCategory)
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
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
      } else {
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (err) {
      toast.error('Error al eliminar');
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
      // Refrescar productos
      fetch('/api/productos')
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-700">Gestión de Productos</h1>
              <p className="text-neutral-600">Administra tu catálogo de productos</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary inline-flex items-center" onClick={handleExport} type="button">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </button>
              <label className="btn-secondary inline-flex items-center cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Importar
                <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
              </label>
              <Link href="/admin/productos/nuevo" className="btn-primary inline-flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">En Stock</option>
              <option value="low-stock">Stock Bajo</option>
              <option value="out-of-stock">Sin Stock</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-700">
                  Productos ({filteredProducts.length})
                </h2>
                <p className="text-sm text-neutral-500">Gestiona tu inventario</p>
              </div>
              <button className="btn-secondary inline-flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
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
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.status === 'active' ? 'En Stock' :
                         product.status === 'low-stock' ? 'Stock Bajo' :
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
                          onClick={() => handleDeleteProduct(product.id)}
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
    </div>
  )
} 