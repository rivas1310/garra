'use client'

import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
import { 
  Ticket, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  Calendar,
  Tag,
  Percent,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'

type DiscountCoupon = {
  id: string
  code: string
  description: string | null
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  minOrderValue: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export default function CuponesPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    couponId: string | null;
    couponCode: string;
  }>({
    isOpen: false,
    couponId: null,
    couponCode: ''
  });
  
  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cupones')
      if (!res.ok) throw new Error('Error al cargar cupones')
      const data = await res.json()
      setCoupons(data)
    } catch (error) {
      log.error('Error fetching coupons:', error)
      toast.error('Error al cargar los cupones')
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const res = await fetch(`/api/cupones/${couponId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Error al eliminar el cupón')
      
      toast.success('Cupón eliminado correctamente')
      fetchCoupons()
    } catch (error) {
      log.error('Error deleting coupon:', error)
      toast.error('Error al eliminar el cupón')
    }
  }

  const openDeleteModal = (couponId: string, couponCode: string) => {
    setDeleteModal({
      isOpen: true,
      couponId,
      couponCode
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      couponId: null,
      couponCode: ''
    });
  };

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (coupon: DiscountCoupon) => {
    if (!coupon.endDate) return false
    return new Date(coupon.endDate) < new Date()
  }

  const getCouponStatus = (coupon: DiscountCoupon) => {
    if (!coupon.isActive) return 'inactive'
    if (isExpired(coupon)) return 'expired'
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return 'used-up'
    return 'active'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Cupones de Descuento</h1>
          <p className="text-neutral-500">Gestiona los cupones de descuento para tu tienda</p>
        </div>
        <Link 
          href="/admin/cupones/nuevo" 
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Cupón
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cupones..."
            className="pl-10 pr-4 py-2 w-full border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchCoupons}
          className="btn-secondary flex items-center gap-2 whitespace-nowrap"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {/* Tabla de cupones */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-500">Cargando cupones...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-1">
              {searchTerm ? 'No se encontraron cupones' : 'No hay cupones disponibles'}
            </h3>
            <p className="text-neutral-500 mb-6">
              {searchTerm 
                ? `No hay resultados para "${searchTerm}". Intenta con otra búsqueda.` 
                : 'Crea tu primer cupón de descuento para tu tienda.'}
            </p>
            <Link href="/admin/cupones/nuevo" className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} />
              Crear Cupón
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Validez
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Usos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredCoupons.map((coupon) => {
                  const status = getCouponStatus(coupon)
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {coupon.code}
                            </div>
                            {coupon.description && (
                              <div className="text-sm text-neutral-500">
                                {coupon.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <Percent className="h-4 w-4 text-primary-500 mr-1" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-primary-500 mr-1" />
                          )}
                          <span className="text-sm text-neutral-900">
                            {coupon.discountType === 'PERCENTAGE' 
                              ? `${coupon.discountValue}%` 
                              : `$${coupon.discountValue.toFixed(2)}`}
                          </span>
                        </div>
                        {coupon.minOrderValue && coupon.minOrderValue > 0 && (
                          <div className="text-xs text-neutral-500 mt-1">
                            Mín: ${coupon.minOrderValue.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-neutral-400 mr-1" />
                          <span className="text-sm text-neutral-500">
                            {formatDate(coupon.startDate)}
                          </span>
                        </div>
                        {coupon.endDate && (
                          <div className="text-xs text-neutral-500 mt-1">
                            Hasta: {formatDate(coupon.endDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {coupon.usedCount} / {coupon.maxUses === null ? '∞' : coupon.maxUses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status === 'active' ? 'bg-green-100 text-green-800' :
                          status === 'inactive' ? 'bg-neutral-100 text-neutral-800' :
                          status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
                          {status === 'expired' && <Calendar className="h-3 w-3 mr-1" />}
                          {status === 'used-up' && <Tag className="h-3 w-3 mr-1" />}
                          {status === 'active' ? 'Activo' :
                           status === 'inactive' ? 'Inactivo' :
                           status === 'expired' ? 'Expirado' :
                           'Agotado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/admin/cupones/${coupon.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(coupon.id, coupon.code)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (deleteModal.couponId) {
            handleDeleteCoupon(deleteModal.couponId);
          }
        }}
        title="Eliminar Cupón"
        message="¿Estás seguro de que deseas eliminar este cupón? Esta acción no se puede deshacer."
        itemName={deleteModal.couponCode}
      />
    </div>
  )
}