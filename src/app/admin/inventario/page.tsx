'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Package, 
  AlertTriangle, 
  AlertCircle,
  TrendingUp, 
  BarChart3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  Loader2,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  Settings,
  DollarSign,
  Building2,
  ToggleLeft
} from 'lucide-react'
import { useInventario } from '@/hooks/useInventario'

const categorias = [
  'Todos',
  'Instrumental',
  'Materiales',
  'Equipos',
  'Consumibles',
  'Medicamentos'
]

const formatNumber = (num: number) => num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')

interface InventarioItem {
  id: number;
  nombre: string;
  sku: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  precio: number;
  proveedor: string;
  fechaVencimiento: string | null;
  activo: boolean;
  imagen: string;
}

interface EditValues {
  stock: number;
  precio: number;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isLoading: boolean;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {title}
          </h3>
        </div>
        <p className="text-sm text-neutral-600 mb-6">
          {message}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [sortBy, setSortBy] = useState('nombre')
  const [sortOrder, setSortOrder] = useState('asc')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<EditValues>({ stock: 0, precio: 0 })
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: InventarioItem | null }>({ isOpen: false, item: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [stockMinFilter, setStockMinFilter] = useState('')
  const [stockMaxFilter, setStockMaxFilter] = useState('')
  const [proveedorFilter, setProveedorFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const itemsPerPage = 12

  // Usar datos reales del inventario
  const { inventario, loading: inventarioLoading, error: inventarioError, refreshInventario, updateProductStatus, deleteProduct, updateProduct } = useInventario()
  
  // Solo usar datos reales de la base de datos
  const inventarioActual = inventario

  // Función para obtener el estado del stock
  const getStockStatus = (item: InventarioItem) => {
    if (item.stock === 0) {
      return { text: 'Sin Stock', color: 'bg-red-100 text-red-800' }
    } else if (item.stock <= item.stockMinimo) {
      return { text: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { text: 'Stock Normal', color: 'bg-green-100 text-green-800' }
    }
  }

  // Filtrar inventario
  const filteredInventario = inventarioActual.filter((item: any) => {
    const matchesSearch = (item.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || item.categoria === selectedCategory
    const matchesStatus = selectedStatus === 'Todos' || 
                         (selectedStatus === 'Activo' && item.activo) ||
                         (selectedStatus === 'Inactivo' && !item.activo) ||
                         (selectedStatus === 'Sin Stock' && item.stock === 0) ||
                         (selectedStatus === 'Stock Bajo' && item.stock <= (item.stockMinimo || 0) && item.stock > 0)
    const matchesStockMin = !stockMinFilter || item.stock >= parseInt(stockMinFilter)
    const matchesStockMax = !stockMaxFilter || item.stock <= parseInt(stockMaxFilter)
    const matchesProveedor = !proveedorFilter || (item.proveedor || '').toLowerCase().includes(proveedorFilter.toLowerCase())
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStockMin && matchesStockMax && matchesProveedor
  })

  // Ordenar inventario
  const sortedInventario = [...filteredInventario].sort((a, b) => {
    let aValue = (a as any)[sortBy]
    let bValue = (b as any)[sortBy]
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Paginación
  const totalPages = Math.ceil(sortedInventario.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInventario = sortedInventario.slice(startIndex, startIndex + itemsPerPage)

  // Estadísticas
  const stats = {
    total: inventarioActual.length,
    activos: inventarioActual.filter((item: any) => item.activo).length,
    sinStock: inventarioActual.filter((item: any) => item.stock === 0).length,
    stockBajo: inventarioActual.filter((item: any) => item.stock <= (item.stockMinimo || 0) && item.stock > 0).length,
    valorTotal: inventarioActual.reduce((sum: number, item: any) => sum + ((item.precio || 0) * (item.stock || 0)), 0)
  }

  // Componente de Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {viewMode === 'grid' ? (
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: itemsPerPage }, (_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex justify-between mb-4">
                  <div className="w-4 h-4 bg-slate-200 rounded"></div>
                  <div className="flex gap-1">
                    <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-slate-200 rounded-2xl mx-auto mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4 mx-auto"></div>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-100 rounded-xl p-3">
                    <div className="h-3 bg-slate-200 rounded mb-2"></div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                {Array.from({ length: 8 }, (_, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: itemsPerPage }, (_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({ length: 8 }, (_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // Funciones de manejo
  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id])
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedInventario.map((item: any) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleEdit = (item: InventarioItem) => {
    setEditingItem(item.id)
    setEditValues({
      stock: item.stock,
      precio: item.precio
    })
  }

  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      const item = inventarioActual.find((item: any) => item.id === editingItem)
      if (item && editingItem !== null) {
        await updateProduct(editingItem.toString(), {
          stock: parseInt(editValues.stock.toString()),
          precio: parseFloat(editValues.precio.toString())
        })
        // Refrescar inventario para obtener datos actualizados
        refreshInventario()
      }
      setEditingItem(null)
      setEditValues({ stock: 0, precio: 0 })
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditValues({ stock: 0, precio: 0 })
  }

  const handleDelete = (item: InventarioItem) => {
    setDeleteModal({ isOpen: true, item })
  }

  const confirmDelete = async () => {
    if (!deleteModal.item) return
    setDeletingId(deleteModal.item.id)
    try {
      await deleteProduct(deleteModal.item.id)
      setDeleteModal({ isOpen: false, item: null })
      // Refrescar inventario para obtener datos actualizados
      refreshInventario()
    } catch (error) {
      console.error('Error al eliminar:', error)
      // Mostrar error al usuario si es necesario
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (id: number) => {
    setTogglingId(id)
    try {
      const item = inventarioActual.find((item: any) => item.id === id)
      if (item) {
        await updateProductStatus(id, !(item as any).activo)
        // Refrescar inventario para obtener datos actualizados
        refreshInventario()
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
    } finally {
      setTogglingId(null)
    }
  }

  // Función de búsqueda con debounce
  const handleSearch = async (term: string) => {
    setIsSearching(true)
    try {
      // Simular delay de búsqueda
      await new Promise(resolve => setTimeout(resolve, 300))
      setSearchTerm(term)
    } catch (error) {
      console.error('Error en búsqueda:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 lg:p-6">
      {/* Header Mejorado */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 lg:p-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Inventario
                  </h1>
                  <p className="text-slate-600 text-sm sm:text-base">Gestión inteligente de productos y stock</p>
                </div>
              </div>
              
              {/* Estadísticas Rápidas en Header */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700">{stats.total} productos</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-700">${formatNumber(stats.valorTotal)} valor total</span>
                </div>
                {stats.sinStock > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-sm font-medium text-red-700">{stats.sinStock} sin stock</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Botones de Acción Mejorados */}
            <div className="flex flex-col sm:flex-row gap-3 xl:flex-col xl:gap-2">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 hover:shadow-md group">
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                  <span className="hidden sm:inline font-medium">Actualizar</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 hover:shadow-md">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Config</span>
                </button>
              </div>
              
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all duration-200 hover:shadow-md">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Exportar</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all duration-200 hover:shadow-md">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Importar</span>
                </button>
              </div>
              
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105 font-medium">
                <Plus className="h-4 w-4" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Detalladas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-500 font-medium">Total Productos</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
          </div>
        </div>
        
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.activos}</p>
              <p className="text-sm text-slate-500 font-medium">Productos Activos</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full" style={{width: `${(stats.activos / stats.total) * 100}%`}}></div>
          </div>
        </div>
        
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.sinStock}</p>
              <p className="text-sm text-slate-500 font-medium">Sin Stock</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full" style={{width: stats.total > 0 ? `${(stats.sinStock / stats.total) * 100}%` : '0%'}}></div>
          </div>
        </div>
        
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.stockBajo}</p>
              <p className="text-sm text-slate-500 font-medium">Stock Bajo</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full" style={{width: stats.total > 0 ? `${(stats.stockBajo / stats.total) * 100}%` : '0%'}}></div>
          </div>
        </div>
        
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xl lg:text-2xl font-bold text-slate-900">${formatNumber(stats.valorTotal)}</p>
              <p className="text-sm text-slate-500 font-medium">Valor Total</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>

      {/* Filtros y Controles Mejorados */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg p-6 lg:p-8 mb-8">
        {/* Header de Filtros */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Filtros y Búsqueda</h3>
              <p className="text-sm text-slate-500">Encuentra productos específicos</p>
            </div>
          </div>
          
          {/* Controles de Vista */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">Tarjetas</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">Tabla</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Barra de búsqueda principal */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            ) : (
              <Search className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            placeholder="Buscar productos por nombre, SKU o descripción..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-900 placeholder-slate-500"
            disabled={isSearching}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
            {isSearching && (
              <div className="text-xs text-blue-600 font-medium animate-pulse">
                Buscando...
              </div>
            )}
            {searchTerm && !isSearching && (
              <button
                onClick={() => handleSearch('')}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Filtros rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-900"
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-900"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
              <option value="Sin Stock">Sin Stock</option>
              <option value="Stock Bajo">Stock Bajo</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-900"
            >
              <option value="nombre">Nombre</option>
              <option value="categoria">Categoría</option>
              <option value="stock">Stock</option>
              <option value="precio">Precio</option>
              <option value="proveedor">Proveedor</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                showAdvancedFilters 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filtros Avanzados</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                  showAdvancedFilters ? 'rotate-180' : ''
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Filtros avanzados mejorados */}
        {showAdvancedFilters && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Filtros Avanzados</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Stock Mínimo</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ej: 10"
                    value={stockMinFilter}
                    onChange={(e) => setStockMinFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-900"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Stock Máximo</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ej: 100"
                    value={stockMaxFilter}
                    onChange={(e) => setStockMaxFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-900"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Proveedor</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar proveedor..."
                    value={proveedorFilter}
                    onChange={(e) => setProveedorFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-900"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStockMinFilter('')
                    setStockMaxFilter('')
                    setProveedorFilter('')
                    setSearchTerm('')
                    setSelectedCategory('Todos')
                    setSelectedStatus('Todos')
                  }}
                  className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 font-medium"
                >
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm">Limpiar Filtros</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido Principal Rediseñado */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Controles de selección mejorados */}
        {selectedItems.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{selectedItems.length}</span>
                </div>
                <span className="text-sm font-semibold text-blue-800">
                  {selectedItems.length} elemento{selectedItems.length > 1 ? 's' : ''} seleccionado{selectedItems.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm bg-white border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium shadow-sm">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </div>
                </button>
                <button className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-sm">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {(isLoading || inventarioLoading) ? (
          <LoadingSkeleton />
        ) : inventarioError ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar inventario</h3>
              <p className="text-red-600 mb-4">{inventarioError}</p>
              <button 
                onClick={refreshInventario}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Vista de Tarjetas Rediseñadas */
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {paginatedInventario.map((item: any) => (
                <div key={item.id} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 hover:-translate-y-1 overflow-hidden">
                  {/* Gradiente de fondo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Header de la tarjeta */}
                  <div className="relative flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-full">#{item.id}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                        title="Editar producto"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar producto"
                      >
                        {deletingId === item.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Imagen y título */}
                  <div className="relative text-center mb-6">
                    <div className="relative inline-block">
                      <img 
                        src={item.imagen} 
                        alt={item.nombre}
                        className="w-20 h-20 mx-auto rounded-2xl object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <Package className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mt-3 mb-1 line-clamp-2 text-sm leading-tight">{item.nombre}</h3>
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">{item.categoria}</span>
                      <span className="text-slate-500 font-mono">{item.sku}</span>
                    </div>
                  </div>
                  
                  {/* Información del producto */}
                  <div className="relative space-y-3">
                    {/* Stock */}
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          Stock
                        </span>
                        {editingItem === item.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editValues.stock}
                              onChange={(e) => setEditValues({...editValues, stock: Number(e.target.value)})}
                              className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button 
                              onClick={handleSaveEdit} 
                              disabled={isSaving}
                              className="p-1 text-green-600 hover:bg-green-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSaving ? (
                                <div className="animate-spin h-3 w-3 border border-green-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                            </button>
                            <button onClick={handleCancelEdit} className="p-1 text-red-600 hover:bg-red-100 rounded-lg">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-900">{item.stock}</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            item.stock <= item.stockMinimo ? 'bg-red-500' : 
                            item.stock <= item.stockMinimo * 2 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((item.stock / (item.stockMinimo * 3)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 mt-1 block">Mín: {item.stockMinimo}</span>
                    </div>
                    
                    {/* Precio */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Precio
                      </span>
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            value={editValues.precio}
                            onChange={(e) => setEditValues({...editValues, precio: Number(e.target.value)})}
                            className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <button 
                            onClick={handleSaveEdit} 
                            disabled={isSaving}
                            className="p-1 text-green-600 hover:bg-green-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? (
                              <div className="animate-spin h-3 w-3 border border-green-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                          </button>
                          <button onClick={handleCancelEdit} className="p-1 text-red-600 hover:bg-red-100 rounded-lg">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-900 text-lg">${formatNumber(item.precio)}</span>
                      )}
                    </div>
                    
                    {/* Estado y Activo */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        getStockStatus(item).color
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          item.stock > item.stockMinimo ? 'bg-green-400' : 
                          item.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        {getStockStatus(item).text}
                      </span>
                      
                      <button
                        onClick={() => handleToggleActive(item.id)}
                        disabled={togglingId === item.id}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          item.activo 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {isLoading ? (
                          <div className="animate-spin w-2 h-2 border border-current border-t-transparent rounded-full mr-2"></div>
                        ) : (
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            item.activo ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        )}
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                    
                    {/* Proveedor */}
                    <div className="text-center pt-2">
                      <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {item.proveedor}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Vista de Tabla Rediseñada */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === paginatedInventario.length && paginatedInventario.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Producto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 rounded-lg transition-colors" onClick={() => handleSort('categoria')}>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Categoría
                      {sortBy === 'categoria' && (
                        <div className="ml-1">
                          {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 rounded-lg transition-colors" onClick={() => handleSort('stock')}>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Stock
                      {sortBy === 'stock' && (
                        <div className="ml-1">
                          {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 rounded-lg transition-colors" onClick={() => handleSort('precio')}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Precio
                      {sortBy === 'precio' && (
                        <div className="ml-1">
                          {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Estado
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Proveedor
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <ToggleLeft className="h-4 w-4" />
                      Activo
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Acciones
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedInventario.map((item: any, index: number) => (
                  <tr key={item.id} className={`group hover:bg-slate-50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                  }`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={item.imagen} 
                            alt={item.nombre}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 shadow-sm"
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{item.id}</span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate">{item.nombre}</div>
                          <div className="text-sm text-slate-500 font-mono">{item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editValues.stock}
                            onChange={(e) => setEditValues({...editValues, stock: Number(e.target.value)})}
                            className="w-20 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                            <Save className="h-4 w-4" />
                          </button>
                          <button onClick={handleCancelEdit} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{item.stock}</span>
                          <span className="text-xs text-slate-500">Min: {item.stockMinimo}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editValues.precio}
                            onChange={(e) => setEditValues({...editValues, precio: Number(e.target.value)})}
                            className="w-24 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                            <Save className="h-4 w-4" />
                          </button>
                          <button onClick={handleCancelEdit} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-slate-900">${formatNumber(item.precio)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getStockStatus(item).color
                      }`}>
                        {getStockStatus(item).text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 font-medium">{item.proveedor}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(item.id)}
                        disabled={togglingId === item.id}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          item.activo 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:scale-105' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200 hover:scale-105'
                        }`}
                      >
                        {togglingId === item.id ? (
                          <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-2" />
                        ) : (
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            item.activo ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        )}
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                          title="Editar producto"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar producto"
                        >
                          {deletingId === item.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación Rediseñada */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 lg:p-8">
            {/* Información de resultados */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="font-medium">
                  Mostrando <span className="text-blue-600 font-bold">{startIndex + 1}</span> a <span className="text-blue-600 font-bold">{Math.min(startIndex + itemsPerPage, sortedInventario.length)}</span> de <span className="text-blue-600 font-bold">{sortedInventario.length}</span> productos
                </span>
              </div>
              
              {/* Selector de elementos por página */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">Mostrar:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newItemsPerPage = parseInt(e.target.value)
                    setCurrentPage(1)
                    // Aquí podrías actualizar itemsPerPage si fuera un estado
                  }}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
                <span className="text-slate-600">por página</span>
              </div>
            </div>
            
            {/* Controles de navegación */}
            <div className="flex items-center gap-2">
              {/* Botón Primera Página */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-600"
                title="Primera página"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
              
              {/* Botón Anterior */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-600"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              
              {/* Números de página */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = []
                  const maxVisible = 5
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                  
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1)
                  }
                  
                  // Primera página si no está visible
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className="w-10 h-10 flex items-center justify-center text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      >
                        1
                      </button>
                    )
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 text-slate-400">...</span>
                      )
                    }
                  }
                  
                  // Páginas visibles
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all duration-200 ${
                          currentPage === i
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-110'
                            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {i}
                      </button>
                    )
                  }
                  
                  // Última página si no está visible
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 text-slate-400">...</span>
                      )
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10 h-10 flex items-center justify-center text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      >
                        {totalPages}
                      </button>
                    )
                  }
                  
                  return pages
                })()}
              </div>
              
              {/* Botón Siguiente */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-600"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
              
              {/* Botón Última Página */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-600"
                title="Última página"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>
            
            {/* Navegación rápida */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Ir a página:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value)
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page)
                  }
                }}
                className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-slate-600">de {totalPages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar "${deleteModal.item?.nombre}"? Esta acción no se puede deshacer.`}
        itemName={deleteModal.item?.nombre || ''}
        isLoading={deletingId !== null}
      />
    </div>
  )
}