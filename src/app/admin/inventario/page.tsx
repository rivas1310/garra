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
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minStock, setMinStock] = useState('')
  const [maxStock, setMaxStock] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [bulkValue, setBulkValue] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    productId: string | null
    productName: string
  }>({ isOpen: false, productId: null, productName: '' });
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
    conditionTag: p.conditionTag || 'GOOD',
    isOnSale: p.isOnSale || false,
  })) : [];

  const filteredItems = mappedInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    
    // Advanced filters
    const matchesMinPrice = !minPrice || item.price >= parseFloat(minPrice)
    const matcheMaxPrice = !maxPrice || item.price <= parseFloat(maxPrice)
    const matchesMinStock = !minStock || item.currentStock >= parseInt(minStock)
    const matchesMaxStock = !maxStock || item.currentStock <= parseInt(maxStock)
    const matchesActive = activeFilter === 'all' || 
                         (activeFilter === 'active' && item.isActive) ||
                         (activeFilter === 'inactive' && !item.isActive)
    
    // Date filters (if lastUpdated exists)
    const matchesDateFrom = !dateFrom || !item.lastUpdated || new Date(item.lastUpdated) >= new Date(dateFrom)
    const matchesDateTo = !dateTo || !item.lastUpdated || new Date(item.lastUpdated) <= new Date(dateTo)
    
    return matchesSearch && matchesCategory && matchesStatus && 
           matchesMinPrice && matcheMaxPrice && matchesMinStock && 
           matchesMaxStock && matchesActive && matchesDateFrom && matchesDateTo
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
          conditionTag: item.conditionTag || 'GOOD',
          isOnSale: item.isOnSale || false,
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

  // Bulk operations functions
  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(item => item.id))
    }
  }

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return

    try {
      const promises = selectedItems.map(async (id) => {
        const updateData: any = {}
        
        switch (bulkAction) {
          case 'updateStock':
            updateData.stock = parseInt(bulkValue)
            break
          case 'updatePrice':
            updateData.price = parseFloat(bulkValue)
            break
          case 'activate':
            updateData.active = true
            break
          case 'deactivate':
            updateData.active = false
            break
          case 'delete':
            return fetch(`/api/productos/${id}`, { method: 'DELETE' })
        }

        if (Object.keys(updateData).length > 0) {
          return fetch(`/api/productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          })
        }
      })

      await Promise.all(promises)
      
      if (bulkAction === 'delete') {
        setInventoryItems(prev => prev.filter(item => !selectedItems.includes(item.id)))
        toast.success(`${selectedItems.length} productos eliminados`)
      } else {
        await fetchInventory() // Refresh data
        toast.success(`${selectedItems.length} productos actualizados`)
      }
      
      setSelectedItems([])
      setShowBulkModal(false)
      setBulkAction('')
      setBulkValue('')
    } catch (error) {
      console.error('Error in bulk operation:', error)
      toast.error('Error en la operación masiva')
    }
  }

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
              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedItems.length} seleccionados
                  </span>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <MoreVertical className="w-3 h-3 mr-1" />
                    Acciones
                  </button>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Limpiar
                  </button>
                </div>
              )}
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

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Stock Distribution Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-neutral-100 p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Distribución de Stock
            </h3>
            <div className="space-y-4">
              {categories.slice(1).map((category) => {
                const categoryItems = mappedInventory.filter(item => item.category === category.name)
                const totalStock = categoryItems.reduce((sum, item) => sum + item.currentStock, 0)
                const maxStock = Math.max(...categories.slice(1).map(cat => 
                  mappedInventory.filter(item => item.category === cat.name)
                    .reduce((sum, item) => sum + item.currentStock, 0)
                ))
                const percentage = maxStock > 0 ? (totalStock / maxStock) * 100 : 0
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-neutral-700">{category.name}</span>
                        <span className="text-sm text-neutral-500">{totalStock} unidades</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Products by Value */}
          <div className="bg-white rounded-xl shadow-lg border border-neutral-100 p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-600" />
              Productos de Mayor Valor
            </h3>
            <div className="space-y-3">
              {mappedInventory
                .sort((a, b) => (b.currentStock * b.cost) - (a.currentStock * a.cost))
                .slice(0, 5)
                .map((item, index) => {
                  const value = item.currentStock * item.cost
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-800 truncate max-w-32">{item.name}</p>
                          <p className="text-xs text-neutral-500">{item.currentStock} unidades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">${formatNumber(value)}</p>
                        <p className="text-xs text-neutral-500">${formatNumber(item.cost)}/u</p>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Alertas de Inventario
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Critical Stock */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-red-800">Stock Crítico</h4>
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600 mb-1">
                {mappedInventory.filter(item => item.status === 'out-of-stock').length}
              </p>
              <p className="text-xs text-red-600">Productos sin stock</p>
            </div>

            {/* Low Stock */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-yellow-800">Stock Bajo</h4>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600 mb-1">
                {mappedInventory.filter(item => item.status === 'low-stock').length}
              </p>
              <p className="text-xs text-yellow-600">Requieren reposición</p>
            </div>

            {/* Healthy Stock */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-800">Stock Saludable</h4>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600 mb-1">
                {mappedInventory.filter(item => item.status === 'in-stock').length}
              </p>
              <p className="text-xs text-green-600">En buen estado</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar productos por nombre, SKU o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-neutral-50 hover:bg-white transition-colors"
              />
            </div>
            
            {/* Primary Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-600">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-600">Estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="in-stock">En Stock</option>
                  <option value="low-stock">Stock Bajo</option>
                  <option value="out-of-stock">Sin Stock</option>
                </select>
              </div>

              {/* Sort */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-600">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="name">Nombre</option>
                  <option value="stock">Stock</option>
                  <option value="price">Precio</option>
                  <option value="sku">SKU</option>
                  <option value="updated">Última actualización</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-600">Acciones rápidas</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex-1 px-3 py-2.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Download className="h-3 w-3 inline mr-1" />
                    Exportar
                  </button>
                  <label className="flex-1 px-3 py-2.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-pointer text-center">
                    <Upload className="h-3 w-3 inline mr-1" />
                    Importar
                    <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-neutral-700">Filtros Avanzados</h3>
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setDateFrom('');
                    setDateTo('');
                    setMinStock('');
                    setMaxStock('');
                    setActiveFilter('all');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Range */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Precio mín.</label>
                    <input
                      type="number"
                      placeholder="$0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Precio máx.</label>
                    <input
                      type="number"
                      placeholder="$999999"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Desde</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Hasta</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Stock Range */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Stock mín.</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      min="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Stock máx.</label>
                    <input
                      type="number"
                      placeholder="999999"
                      value={maxStock}
                      onChange={(e) => setMaxStock(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      min="0"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Estado activo</label>
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>
            </div>
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
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Activo
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.image || '/img/placeholder.svg'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-neutral-200 shadow-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/img/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-neutral-900 truncate">{item.name}</div>
                          <div className="text-xs text-neutral-500 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                              {item.category}
                            </span>
                          </div>
                          {item.conditionTag && (
                            <div className="text-xs text-blue-600 mt-1 font-medium">
                              {item.conditionTag}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-800">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-neutral-100 text-neutral-700">
                          {item.sku}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editForm.stock}
                            onChange={(e) => setEditForm(prev => ({ ...prev, stock: e.target.value }))}
                            className="w-16 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                          <div className="text-xs text-neutral-500">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-semibold text-neutral-800">{item.currentStock}</div>
                          <div className="text-xs text-neutral-500">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                            className="w-20 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                          />
                          <div className="text-xs text-neutral-500">
                            Costo: ${item.cost}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-semibold text-green-700">${item.price}</div>
                          <div className="text-xs text-neutral-500">
                            Costo: ${item.cost}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(item.status)}`}>
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

          {/* Mobile and Tablet Card View */}
          <div className="lg:hidden space-y-4 p-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || '/img/placeholder.svg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-neutral-200 shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/img/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-semibold text-neutral-900 truncate">{item.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                            {item.category}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono bg-neutral-100 text-neutral-700">
                            {item.sku}
                          </span>
                        </div>
                        {item.conditionTag && (
                          <div className="text-xs text-blue-600 mt-1 font-medium">
                            {item.conditionTag}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
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
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Stock</span>
                      <div className="mt-1">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            value={editForm.stock}
                            onChange={(e) => setEditForm(prev => ({ ...prev, stock: e.target.value }))}
                            className="w-20 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                        ) : (
                          <div className="text-sm font-semibold text-neutral-800">
                            {item.currentStock}
                          </div>
                        )}
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Min: {item.minStock} | Max: {item.maxStock}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Estado</span>
                      <div className="mt-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Precio</span>
                      <div className="mt-1">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                            className="w-20 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-sm font-semibold text-green-700">
                            ${item.price}
                          </div>
                        )}
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Costo: ${item.cost}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Activo</span>
                      <div className="mt-1">
                        <div className="flex items-center gap-2">
                          {getActiveStatusIcon(item.isActive)}
                          <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${getActiveStatusColor(item.isActive)}`}>
                            {getActiveStatusText(item.isActive)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {editingItem === item.id && (
                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-neutral-100">
                    <button
                      onClick={() => handleSave(item.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
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

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Operaciones en Lote
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              {selectedItems.length} productos seleccionados
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Acción
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar acción</option>
                  <option value="updateStock">Actualizar Stock</option>
                  <option value="updatePrice">Actualizar Precio</option>
                  <option value="activate">Activar</option>
                  <option value="deactivate">Desactivar</option>
                  <option value="delete">Eliminar</option>
                </select>
              </div>
              
              {(bulkAction === 'updateStock' || bulkAction === 'updatePrice') && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {bulkAction === 'updateStock' ? 'Nuevo Stock' : 'Nuevo Precio'}
                  </label>
                  <input
                    type="number"
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    step={bulkAction === 'updatePrice' ? '0.01' : '1'}
                    placeholder={bulkAction === 'updateStock' ? 'Cantidad' : 'Precio'}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkAction('');
                  setBulkValue('');
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || (bulkAction === 'updateStock' || bulkAction === 'updatePrice') && !bulkValue}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

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