'use client'

import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
import Link from 'next/link'
import { 
  Package, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Upload,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Power,
  PowerOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'

const categories = [
  { id: 'all', name: 'Todas las categorías' },
  { id: 'mujer', name: 'Mujer' },
  { id: 'hombre', name: 'Hombre' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'calzado', name: 'Calzado' },
  { id: 'bolsos', name: 'Bolsos' },
  { id: 'deportes', name: 'Deportes' }
]

// Formateador manual de miles para evitar errores de hidratación SSR/CSR
function formatNumber(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function InventarioPage() {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/productos?admin=true&limit=1000');
      const data = await response.json();
      log.error('Datos recibidos en inventario:', data);
      if (Array.isArray(data)) {
        setInventoryItems(data);
      } else if (Array.isArray(data.productos)) {
        setInventoryItems(data.productos);
      } else if (Array.isArray(data.products)) {
        setInventoryItems(data.products);
      } else {
        setInventoryItems([]);
      }
    } catch (error) {
      toast.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSyncProducts = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/sync-products', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        // Recargar inventario después de sincronizar
        await fetchInventory();
      } else {
        toast.error(result.error || 'Error al sincronizar productos');
      }
    } catch (error) {
      toast.error('Error al sincronizar productos');
    } finally {
      setSyncing(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: ''
  });
  const [editForm, setEditForm] = useState({
    stock: '',
    price: '',
    minStock: '',
    maxStock: ''
  })

  const mappedInventory = Array.isArray(inventoryItems) ? inventoryItems.map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.slug,
    category: p.category?.name ?? '',
    categoryId: p.categoryId,
    description: p.description || '',
    currentStock: Number(p.stock),
    minStock: 0,
    maxStock: 0,
    price: p.price,
    originalPrice: p.originalPrice,
    cost: 0,
    margin: 0,
    status: Number(p.stock) === 0 ? 'out-of-stock' : Number(p.stock) < 5 ? 'low-stock' : 'in-stock',
    isActive: p.isActive,
    lastUpdated: p.updatedAt,
    supplier: '',
    location: '',
    image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/img/placeholder.png',
    images: p.images || [],
    isNew: p.isNew || false,
    isOnSale: p.isOnSale || false,
    isSecondHand: p.isSecondHand || false,
  })) : [];

  const filteredItems = mappedInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleEdit = (itemId: number) => {
    const item = mappedInventory.find(i => i.id === itemId)
    if (item) {
      setEditForm({
        stock: (item.currentStock ?? '').toString(),
        price: (item.price ?? '').toString(),
        minStock: (item.minStock ?? '').toString(),
        maxStock: (item.maxStock ?? '').toString()
      })
      setEditingItem(itemId)
    }
  }

  const handleSave = async (itemId: number) => {
    try {
      const item = mappedInventory.find(i => i.id === itemId);
      if (!item) return;

      const response = await fetch(`/api/productos/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.name,
          description: item.description || '',
          categoryId: item.categoryId,
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock),
          images: item.images || [],
          isNew: item.isNew || false,
          isOnSale: item.isOnSale || false,
          isSecondHand: item.isSecondHand || false,
        }),
      });

      const result = await response.json();
      
      if (result.ok) {
        toast.success(result.message || 'Inventario actualizado correctamente');
        await fetchInventory(); // Recargar datos
      } else {
        toast.error(result.error || 'Error al actualizar el producto');
      }
    } catch (error) {
      toast.error('Error al actualizar el producto');
    }
    setEditingItem(null);
  }

  const handleCancel = () => {
    setEditingItem(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'low-stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'out-of-stock':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'En Stock'
      case 'low-stock':
        return 'Stock Bajo'
      case 'out-of-stock':
        return 'Sin Stock'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800'
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out-of-stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getActiveStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <Power className="h-4 w-4 text-green-600" />
    ) : (
      <PowerOff className="h-4 w-4 text-red-600" />
    );
  };

  const getActiveStatusText = (isActive: boolean) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  const getActiveStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Exportar inventario a CSV
  const handleExport = () => {
    const csvRows = [
      ['ID', 'Nombre', 'SKU', 'Categoría', 'Stock', 'Precio', 'Estado', 'Activo'],
      ...mappedInventory.map(p => [
        p.id,
        p.name,
        p.sku,
        p.category,
        p.currentStock,
        p.price,
        getStatusText(p.status),
        p.isActive ? 'Sí' : 'No'
      ])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Inventario exportado como CSV');
  };

  // Importar inventario desde CSV y guardar en la base de datos
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Obtener categorías reales
    const categorias = await fetch('/api/categorias').then(res => res.json());
    const categoriaMap = Object.fromEntries(categorias.map((c: any) => [c.name.toLowerCase(), c.id]));
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(1); // Saltar encabezado
      let success = 0;
      let fail = 0;
      for (const line of lines) {
        const [id, name, sku, category, stock, price, image] = line.split(',');
        if (!name) continue;
        const categoryId = categoriaMap[category?.toLowerCase?.() || ''];
        if (!categoryId) {
          toast.error(`Categoría no encontrada: ${category}`);
          fail++;
          continue;
        }
        try {
          const res = await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              description: '',
              categoryId,
              price,
              stock,
              images: image ? [image] : [],
              isActive: parseInt(stock) > 0, // Activo solo si tiene stock
              isNew: false,
              isOnSale: false,
              variants: [],
            }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            toast.error(errorData.detalle || errorData.error || 'Error al importar');
            fail++;
            continue;
          }
          success++;
        } catch (err) {
          toast.error('Error de red al importar');
          fail++;
        }
      }
      toast.success(`Importación completada: ${success} productos importados, ${fail} fallidos`);
      // Refrescar inventario
      await fetchInventory();
    };
    reader.readAsText(file);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch('/api/productos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      });
      const data = await res.json();
      if (data.ok) {
        setInventoryItems(prev => prev.filter(p => p.id !== productId));
        toast.success('Producto eliminado');
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

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-700">Control de Inventario</h1>
              <p className="text-sm sm:text-base text-neutral-600">Gestiona stock, precios y proveedores</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button className="btn-secondary inline-flex items-center text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2" onClick={handleExport} type="button">
                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Exportar</span>
                <span className="sm:hidden">Export</span>
              </button>
              <label className="btn-secondary inline-flex items-center cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Importar</span>
                <span className="sm:hidden">Import</span>
                <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
              </label>
              <button className="btn-primary inline-flex items-center text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2" onClick={handleSyncProducts} disabled={syncing}>
                {syncing ? (
                  <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="hidden sm:inline">{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                <span className="sm:hidden">{syncing ? 'Sync...' : 'Sync'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-elegant p-3 sm:p-6 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-neutral-500">Total Productos</p>
                <p className="text-lg sm:text-2xl font-bold text-neutral-700">{mappedInventory.length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-primary-50 text-primary-600">
                <Package className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-elegant p-3 sm:p-6 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-neutral-500">Stock Bajo</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {mappedInventory.filter(item => item.status === 'low-stock').length}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-yellow-50 text-yellow-600">
                <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-elegant p-3 sm:p-6 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-neutral-500">Sin Stock</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  {mappedInventory.filter(item => item.status === 'out-of-stock').length}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-red-50 text-red-600">
                <XCircle className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-elegant p-3 sm:p-6 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-neutral-500">Valor Total</p>
                <p className="text-lg sm:text-2xl font-bold text-neutral-700">
                  ${formatNumber(mappedInventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0))}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-green-50 text-green-600">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-3 w-3 sm:h-4 sm:w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 sm:px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="px-2 sm:px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="in-stock">En Stock</option>
              <option value="low-stock">Stock Bajo</option>
              <option value="out-of-stock">Sin Stock</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 sm:px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="stock">Ordenar por stock</option>
              <option value="price">Ordenar por precio</option>
              <option value="sku">Ordenar por SKU</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 overflow-hidden">
          <div className="p-3 sm:p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-neutral-700">
                  Inventario ({filteredItems.length})
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500">Gestiona stock y precios</p>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Margen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Activo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-700">{item.name}</div>
                        <div className="text-sm text-neutral-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-600 font-mono">{item.sku}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editForm.stock}
                            onChange={(e) => setEditForm(prev => ({ ...prev, stock: e.target.value }))}
                            className="w-16 px-2 py-1 border border-neutral-200 rounded text-sm"
                            min="0"
                          />
                          <div className="text-xs text-neutral-500">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-neutral-700">{item.currentStock}</div>
                          <div className="text-xs text-neutral-500">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                            className="w-20 px-2 py-1 border border-neutral-200 rounded text-sm"
                            min="0"
                            step="0.01"
                          />
                          <div className="text-xs text-neutral-500">
                            Costo: ${item.cost}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-neutral-700">${item.price}</div>
                          <div className="text-xs text-neutral-500">
                            Costo: ${item.cost}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          item.margin > 50 ? 'text-green-600' : 
                          item.margin > 30 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.margin}%
                        </span>
                        {item.margin > 50 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getActiveStatusIcon(item.isActive)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActiveStatusColor(item.isActive)}`}>
                          {getActiveStatusText(item.isActive)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSave(item.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Guardar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/productos/${item.id}`}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Eliminar producto"
                            onClick={() => openDeleteModal(item.id, item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="divide-y divide-neutral-100">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-neutral-700 mb-1">{item.name}</h3>
                      <p className="text-xs text-neutral-500 mb-1">{item.category}</p>
                      <p className="text-xs text-neutral-400 font-mono">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Link
                        href={`/admin/productos/${item.id}`}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"
                        title="Eliminar producto"
                        onClick={() => openDeleteModal(item.id, item.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500">Stock:</span>
                      <div className="font-medium text-neutral-700">{item.currentStock}</div>
                      <div className="text-neutral-400">Min: {item.minStock} | Max: {item.maxStock}</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">Precio:</span>
                      <div className="font-medium text-neutral-700">${item.price}</div>
                      <div className="text-neutral-400">Costo: ${item.cost}</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">Margen:</span>
                      <div className={`font-medium flex items-center gap-1 ${
                        item.margin > 50 ? 'text-green-600' : 
                        item.margin > 30 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {item.margin}%
                        {item.margin > 50 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-500">Estado:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {getStatusIcon(item.status)}
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {getActiveStatusIcon(item.isActive)}
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getActiveStatusColor(item.isActive)}`}>
                        {getActiveStatusText(item.isActive)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs sm:text-sm text-neutral-500">
                Mostrando 1-{filteredItems.length} de {filteredItems.length} productos
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-neutral-200 rounded hover:bg-neutral-50">
                  Anterior
                </button>
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-primary-500 text-white rounded">
                  1
                </button>
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-neutral-200 rounded hover:bg-neutral-50">
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