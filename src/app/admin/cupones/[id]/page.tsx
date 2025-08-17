'use client'

import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Percent, 
  DollarSign,
  Tag,
  Info,
  Save,
  Loader
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'

interface CouponForm {
  code: string
  description: string
  discountType: DiscountType
  discountValue: string
  minOrderValue: string
  maxUses: string
  isActive: boolean
  startDate: string
  endDate: string
}

export default function EditarCuponPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CouponForm>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '0',
    maxUses: '1',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        // Resolver params que es una promesa
        const resolvedParams = await params;
        const res = await fetch(`/api/cupones/${resolvedParams.id}`)
        if (!res.ok) throw new Error('Error al cargar el cupón')
        
        const coupon = await res.json()
        
        setForm({
          code: coupon.code,
          description: coupon.description || '',
          discountType: coupon.discountType,
          discountValue: coupon.discountValue.toString(),
          minOrderValue: (coupon.minOrderValue || 0).toString(),
          maxUses: (coupon.maxUses === null ? '' : coupon.maxUses).toString(),
          isActive: coupon.isActive,
          startDate: new Date(coupon.startDate).toISOString().split('T')[0],
          endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : ''
        })
      } catch (error) {
        log.error('Error fetching coupon:', error)
        toast.error('Error al cargar el cupón')
        router.push('/admin/cupones')
      } finally {
        setLoading(false)
      }
    }

    fetchCoupon()
  }, [params, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setForm(prev => ({ ...prev, [name]: checked }))
  }

  const validateForm = () => {
    if (!form.code.trim()) {
      toast.error('El código del cupón es obligatorio')
      return false
    }

    if (form.discountType === 'PERCENTAGE') {
      const value = parseFloat(form.discountValue)
      if (isNaN(value) || value <= 0 || value > 100) {
        toast.error('El porcentaje de descuento debe ser un número entre 1 y 100')
        return false
      }
    } else {
      const value = parseFloat(form.discountValue)
      if (isNaN(value) || value <= 0) {
        toast.error('El monto de descuento debe ser un número mayor a 0')
        return false
      }
    }

    if (form.minOrderValue && parseFloat(form.minOrderValue) < 0) {
      toast.error('El valor mínimo de pedido no puede ser negativo')
      return false
    }

    if (form.maxUses && parseInt(form.maxUses) < 1) {
      toast.error('El número máximo de usos debe ser al menos 1')
      return false
    }

    if (form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('La fecha de finalización debe ser posterior a la fecha de inicio')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSaving(true)
    
    try {
      const payload = {
        ...form,
        discountValue: parseFloat(form.discountValue),
        minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : 0,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        endDate: form.endDate || null
      }
      
      // Resolver params que es una promesa
      const resolvedParams = await params;
      const res = await fetch(`/api/cupones/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Error al actualizar el cupón')
      }
      
      toast.success('Cupón actualizado correctamente')
      router.push('/admin/cupones')
    } catch (error) {
      log.error('Error updating coupon:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el cupón')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-500">Cargando información del cupón...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/admin/cupones" 
          className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={16} />
          Volver a cupones
        </Link>
        <h1 className="text-2xl font-bold text-neutral-800">Editar Cupón</h1>
        <p className="text-neutral-500">Modifica los detalles del cupón de descuento</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código del cupón */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-1">
                Código del Cupón *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Ej: VERANO2023"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <p className="mt-1 text-xs text-neutral-500">
                Este es el código que los clientes ingresarán para aplicar el descuento
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Ej: Descuento de verano 2023"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Una breve descripción del propósito del cupón (opcional)
              </p>
            </div>

            {/* Tipo de descuento */}
            <div>
              <label htmlFor="discountType" className="block text-sm font-medium text-neutral-700 mb-1">
                Tipo de Descuento *
              </label>
              <div className="relative">
                <select
                  id="discountType"
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                  required
                >
                  <option value="PERCENTAGE">Porcentaje (%)</option>
                  <option value="FIXED_AMOUNT">Monto Fijo ($)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {form.discountType === 'PERCENTAGE' ? (
                    <Percent className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-neutral-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Valor del descuento */}
            <div>
              <label htmlFor="discountValue" className="block text-sm font-medium text-neutral-700 mb-1">
                Valor del Descuento *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="discountValue"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={handleChange}
                  placeholder={form.discountType === 'PERCENTAGE' ? "Ej: 15" : "Ej: 100"}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                  max={form.discountType === 'PERCENTAGE' ? "100" : undefined}
                  step="any"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {form.discountType === 'PERCENTAGE' ? (
                    <span className="text-neutral-500">%</span>
                  ) : (
                    <span className="text-neutral-500">$</span>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {form.discountType === 'PERCENTAGE' 
                  ? 'Porcentaje de descuento (1-100)' 
                  : 'Monto fijo a descontar del total'}
              </p>
            </div>

            {/* Valor mínimo de pedido */}
            <div>
              <label htmlFor="minOrderValue" className="block text-sm font-medium text-neutral-700 mb-1">
                Valor Mínimo de Pedido
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="minOrderValue"
                  name="minOrderValue"
                  value={form.minOrderValue}
                  onChange={handleChange}
                  placeholder="Ej: 100"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                  step="any"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-neutral-500">$</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Valor mínimo del pedido para aplicar el cupón (0 = sin mínimo)
              </p>
            </div>

            {/* Número máximo de usos */}
            <div>
              <label htmlFor="maxUses" className="block text-sm font-medium text-neutral-700 mb-1">
                Número Máximo de Usos
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="maxUses"
                  name="maxUses"
                  value={form.maxUses}
                  onChange={handleChange}
                  placeholder="Ej: 100"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Tag className="h-4 w-4 text-neutral-500" />
                </div>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Cuántas veces se puede usar este cupón (dejar vacío para usos ilimitados)
              </p>
            </div>

            {/* Fecha de inicio */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-1">
                Fecha de Inicio *
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                </div>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Fecha a partir de la cual el cupón estará activo
              </p>
            </div>

            {/* Fecha de fin */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 mb-1">
                Fecha de Fin
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                </div>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Fecha hasta la cual el cupón estará activo (dejar vacío para que no expire)
              </p>
            </div>
          </div>

          {/* Estado del cupón */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-neutral-700">
              Cupón activo
            </label>
          </div>

          {/* Información adicional */}
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-primary-800">Información importante</h4>
              <ul className="mt-1 text-xs text-primary-700 space-y-1 list-disc list-inside">
                <li>Los cupones con fecha de fin expirarán automáticamente después de esa fecha</li>
                <li>Los cupones inactivos no podrán ser utilizados por los clientes</li>
                <li>Si estableces un número máximo de usos, el cupón se desactivará automáticamente después de alcanzar ese límite</li>
              </ul>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <Link 
              href="/admin/cupones" 
              className="btn-secondary"
            >
              Cancelar
            </Link>
            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Actualizar Cupón
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}