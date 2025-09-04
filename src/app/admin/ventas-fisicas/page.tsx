'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  Calendar,
  Download,
  Filter,
  ArrowLeft,
  Eye
} from 'lucide-react'
import VentaFisicaDetailsModal from '@/components/VentaFisicaDetailsModal'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface VentaFisica {
  id: string
  createdAt: string
  updatedAt: string
  total: number
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      images: string[]
    }
  }[]
  user: {
    name: string
    email: string
  }
}

export default function VentasFisicasPage() {
  const [ventas, setVentas] = useState<VentaFisica[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('') // YYYY-MM-DD
  const [selectedVentaId, setSelectedVentaId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchVentasFisicas()
  }, [dateFilter])

  const fetchVentasFisicas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let url = '/api/ventas-fisicas'
      if (dateFilter) {
        url += `?date=${dateFilter}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar las ventas físicas')
      }
      
      setVentas(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'PPpp', { locale: es })
  }

  const filteredVentas = ventas.filter(venta => 
    venta.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venta.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venta.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setDateFilter('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4 text-primary-600" />
          <p className="text-sm sm:text-base text-neutral-600">Cargando ventas físicas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-elegant animate-fade-in">
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Historial de Ventas Físicas</h1>
              <p className="text-sm sm:text-lg text-primary-100 font-medium">Gestiona y revisa todas las ventas físicas realizadas en el sistema</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-0">
              <Link href="/admin/venta-fisica" className="bg-white text-primary-700 hover:bg-primary-50 hover:shadow-lg transition-all duration-200 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3 sm:py-3 sm:px-6 rounded-lg font-semibold">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                Nueva Venta
              </Link>
              <button 
                onClick={fetchVentasFisicas}
                className="bg-primary-500 text-white hover:bg-primary-400 hover:shadow-lg transition-all duration-200 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3 sm:py-3 sm:px-6 rounded-lg font-semibold disabled:opacity-50"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8">
        {/* Estadísticas */}
        {!loading && ventas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Ventas</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{ventas.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Ingresos Totales</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(ventas.reduce((sum, venta) => sum + venta.total, 0))}</p>
                </div>
                <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">$</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Promedio por Venta</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(ventas.length > 0 ? ventas.reduce((sum, venta) => sum + venta.total, 0) / ventas.length : 0)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AVG</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Productos Vendidos</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{ventas.reduce((sum, venta) => sum + venta.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">#</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-neutral-200 backdrop-blur-sm">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-800 mb-2">Filtros de búsqueda</h2>
            <p className="text-xs sm:text-sm text-neutral-600">Utiliza los filtros para encontrar ventas específicas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-neutral-700">Búsqueda general</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por ID, cliente o email..."
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-neutral-50 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-neutral-700">Filtrar por fecha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                </div>
                <input
                  type="date"
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-neutral-50 focus:bg-white"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-neutral-700">Acciones</label>
              <button 
                onClick={resetFilters}
                className="w-full btn-secondary py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm flex items-center justify-center hover:shadow-md transition-all duration-200"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de ventas */}
        {error ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar las ventas</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button 
                onClick={fetchVentasFisicas}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 inline-flex items-center gap-2 hover:shadow-md"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar carga
              </button>
            </div>
          </div>
        ) : filteredVentas.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-3">No hay ventas físicas</h3>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                {searchTerm || dateFilter ? 
                  'No se encontraron ventas con los filtros aplicados. Intenta ajustar los criterios de búsqueda.' : 
                  'Aún no se han registrado ventas físicas en el sistema. ¡Comienza creando tu primera venta!'}
              </p>
              {searchTerm || dateFilter ? (
                <button 
                  onClick={resetFilters}
                  className="bg-neutral-600 hover:bg-neutral-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 inline-flex items-center gap-2 hover:shadow-md"
                >
                  <Filter className="h-5 w-5" />
                  Limpiar filtros
                </button>
              ) : (
                <Link href="/admin/venta-fisica" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 inline-flex items-center gap-2 hover:shadow-md">
                  <ShoppingBag className="h-5 w-5" />
                  Crear primera venta
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
          {/* Vista de tarjetas para móviles */}
          <div className="block sm:hidden space-y-4">
            {filteredVentas.map((venta) => (
              <div key={venta.id} className="bg-white rounded-xl shadow-lg border border-neutral-200 p-4 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">ID</div>
                      <div className="h-1 w-1 bg-neutral-300 rounded-full"></div>
                      <div className="text-xs text-neutral-500">{formatDate(venta.createdAt)}</div>
                    </div>
                    <div className="text-sm font-bold text-neutral-900 font-mono bg-neutral-100 px-2 py-1 rounded">{venta.id.substring(0, 8)}...</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Total</div>
                    <div className="text-lg font-bold text-green-600">{formatCurrency(venta.total)}</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">{venta.user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-neutral-800">{venta.user.name}</div>
                      <div className="text-xs text-neutral-600 truncate">{venta.user.email}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Productos</div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {venta.items.length} {venta.items.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-600 line-clamp-2">
                    {venta.items.map(item => item.product.name).join(', ')}
                  </div>
                </div>
                
                <div className="border-t border-neutral-200 pt-3">
                  <button 
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 hover:shadow-md"
                    onClick={() => {
                      setSelectedVentaId(venta.id)
                      setIsModalOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Ver detalles completos</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Vista de tabla para pantallas medianas y grandes */}
          <div className="hidden sm:block bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        ID de Venta
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Productos
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-100">
                  {filteredVentas.map((venta, index) => (
                    <tr key={venta.id} className={`hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-25'}`}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                            <span className="text-primary-700 font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-neutral-900 font-mono bg-neutral-100 px-2 py-1 rounded">
                              {venta.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-800">{formatDate(venta.createdAt)}</div>
                        <div className="text-xs text-neutral-500">{new Date(venta.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-semibold text-sm">{venta.user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-neutral-800">{venta.user.name}</div>
                            <div className="text-xs text-neutral-500 max-w-xs truncate">{venta.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                              {venta.items.length} {venta.items.length === 1 ? 'producto' : 'productos'}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-600 max-w-xs line-clamp-2">
                            {venta.items.map(item => item.product.name).join(', ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-lg font-bold text-green-600">{formatCurrency(venta.total)}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <button 
                          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 inline-flex items-center gap-2 hover:shadow-md transform hover:scale-105"
                          onClick={() => {
                            setSelectedVentaId(venta.id)
                            setIsModalOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden lg:inline">Ver detalles</span>
                          <span className="lg:hidden">Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>
      
      {/* Modal de detalles */}
      <VentaFisicaDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ventaId={selectedVentaId}
      />
    </div>
  )
}