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
    <div className="min-h-screen bg-gradient-elegant">
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-neutral-700 truncate">Historial de Ventas Físicas</h1>
              <p className="text-xs sm:text-base text-neutral-600">Visualiza y gestiona todas las ventas realizadas en tienda</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <Link href="/admin/venta-fisica" className="btn-primary inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3">
                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Nueva Venta
              </Link>
              <button 
                onClick={fetchVentasFisicas}
                className="btn-secondary inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3"
                disabled={loading}
              >
                <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-elegant p-3 sm:p-4 mb-4 sm:mb-6 border border-neutral-100">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por ID, cliente o email..."
                className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm border border-neutral-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              <div className="relative flex items-center w-full">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                </div>
                <input
                  type="date"
                  className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                />
              </div>
              <button 
                onClick={resetFilters}
                className="btn-secondary py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto flex items-center justify-center"
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de ventas */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-red-800 text-sm sm:text-base mb-3 sm:mb-4">{error}</p>
            <button 
              onClick={fetchVentasFisicas}
              className="btn-primary text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : filteredVentas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-4 sm:p-8 text-center">
            <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-neutral-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-1 sm:mb-2">No hay ventas físicas</h3>
            <p className="text-sm sm:text-base text-neutral-600 mb-4 sm:mb-6">
              {searchTerm || dateFilter ? 
                'No se encontraron ventas con los filtros aplicados.' : 
                'Aún no se han registrado ventas físicas en el sistema.'}
            </p>
            {searchTerm || dateFilter ? (
              <button 
                onClick={resetFilters}
                className="btn-secondary inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4"
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Limpiar filtros
              </button>
            ) : (
              <Link href="/admin/venta-fisica" className="btn-primary inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4">
                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Crear venta física
              </Link>
            )}
          </div>
        ) : (
          <>
          {/* Vista de tarjetas para móviles */}
          <div className="block sm:hidden space-y-3">
            {filteredVentas.map((venta) => (
              <div key={venta.id} className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-3 overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs text-neutral-500">ID:</div>
                    <div className="text-sm font-medium text-neutral-900 truncate">{venta.id.substring(0, 8)}...</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-500">Total:</div>
                    <div className="text-sm font-semibold text-neutral-900">{formatCurrency(venta.total)}</div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-xs text-neutral-500">Fecha:</div>
                  <div className="text-sm text-neutral-700">{formatDate(venta.createdAt)}</div>
                </div>
                
                <div className="mb-2">
                  <div className="text-xs text-neutral-500">Cliente:</div>
                  <div className="text-sm font-medium text-neutral-700">{venta.user.name}</div>
                  <div className="text-xs text-neutral-500 truncate">{venta.user.email}</div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-neutral-500 mb-1">Productos:</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {venta.items.length} productos
                  </span>
                  <div className="text-xs text-neutral-500 mt-1 truncate">
                    {venta.items.map(item => item.product.name).join(', ')}
                  </div>
                </div>
                
                <div className="border-t border-neutral-100 pt-2 mt-2">
                  <button 
                    className="w-full text-primary-600 hover:text-primary-900 inline-flex items-center justify-center gap-1 py-1.5"
                    onClick={() => {
                      setSelectedVentaId(venta.id)
                      setIsModalOpen(true)
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Ver detalles</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Vista de tabla para pantallas medianas y grandes */}
          <div className="hidden sm:block bg-white rounded-lg shadow-elegant border border-neutral-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 table-auto">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Productos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredVentas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {venta.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {formatDate(venta.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        <div className="font-medium">{venta.user.name}</div>
                        <div className="text-neutral-500 text-xs">{venta.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                            {venta.items.length} productos
                          </span>
                          <div className="text-xs text-neutral-500 max-w-xs truncate">
                            {venta.items.map(item => item.product.name).join(', ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {formatCurrency(venta.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1"
                          onClick={() => {
                            setSelectedVentaId(venta.id)
                            setIsModalOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          Ver
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