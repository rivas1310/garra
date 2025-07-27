'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingBag, Package, User, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface VentaFisicaDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  ventaId: string | null
}

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

export default function VentaFisicaDetailsModal({ isOpen, onClose, ventaId }: VentaFisicaDetailsModalProps) {
  const [venta, setVenta] = useState<VentaFisica | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && ventaId) {
      fetchVentaDetails()
    }
  }, [isOpen, ventaId])

  const fetchVentaDetails = async () => {
    if (!ventaId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/ventas-fisicas/${ventaId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar los detalles de la venta')
      }
      
      setVenta(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-2 sm:p-4 border-b border-neutral-200">
          <div className="flex items-center gap-1 sm:gap-2">
            <ShoppingBag className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary-600" />
            <h2 className="text-sm sm:text-lg font-semibold text-neutral-900 truncate">Detalles de Venta Física</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors p-1"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center h-36 sm:h-64">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-800 p-2 sm:p-4 rounded-lg text-xs sm:text-base">
              {error}
            </div>
          ) : !venta ? (
            <div className="text-center text-neutral-600 p-2 sm:p-4 text-xs sm:text-base">
              No se encontraron detalles para esta venta.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-neutral-50 p-2 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-neutral-600" />
                    <h3 className="font-medium text-neutral-900 text-xs sm:text-base">Información de la Venta</h3>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <p><span className="text-neutral-500">ID:</span> <span className="break-all">{venta.id}</span></p>
                    <p><span className="text-neutral-500">Fecha:</span> {formatDate(venta.createdAt)}</p>
                    <p><span className="text-neutral-500">Total:</span> {formatCurrency(venta.total)}</p>
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-2 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-neutral-600" />
                    <h3 className="font-medium text-neutral-900 text-xs sm:text-base">Cliente</h3>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <p><span className="text-neutral-500">Nombre:</span> {venta.user.name}</p>
                    <p><span className="text-neutral-500">Email:</span> <span className="break-all">{venta.user.email}</span></p>
                  </div>
                </div>
              </div>
              
              {/* Productos */}
              <div>
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-neutral-600" />
                  <h3 className="font-medium text-neutral-900 text-xs sm:text-base">Productos ({venta.items.length})</h3>
                </div>
                
                {/* Vista de tabla para pantallas medianas y grandes */}
                <div className="hidden sm:block border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Precio
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {venta.items.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-neutral-900">
                            <div className="flex items-center gap-2">
                              {item.product.images && item.product.images[0] ? (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name} 
                                  className="h-10 w-10 object-cover rounded-md"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-neutral-200 rounded-md flex items-center justify-center">
                                  <Package className="h-5 w-5 text-neutral-400" />
                                </div>
                              )}
                              <span>{item.product.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-900 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-900 text-right">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-neutral-900 text-right">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-neutral-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-neutral-900 text-right">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-neutral-900 text-right">
                          {formatCurrency(venta.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {/* Vista de tarjetas para móviles */}
                <div className="sm:hidden space-y-2">
                  {venta.items.map((item) => (
                    <div key={item.id} className="border border-neutral-200 rounded-lg p-2 bg-white">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {item.product.images && item.product.images[0] ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="h-10 w-10 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-neutral-200 rounded-md flex items-center justify-center">
                            <Package className="h-4 w-4 text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-neutral-900 truncate">{item.product.name}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-xs">
                        <div>
                          <p className="text-neutral-500">Cantidad</p>
                          <p className="font-medium text-neutral-900">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Precio</p>
                          <p className="font-medium text-neutral-900">{formatCurrency(item.price)}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Subtotal</p>
                          <p className="font-medium text-neutral-900">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-xs font-medium text-neutral-900">Total:</span>
                    <span className="text-sm font-bold text-neutral-900">{formatCurrency(venta.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-neutral-200 p-2 sm:p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="btn-secondary text-xs sm:text-base py-1 sm:py-2 px-2 sm:px-4 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
} 