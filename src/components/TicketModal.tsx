import React from 'react'
import { log } from '@/lib/secureLogger'
import { Printer } from 'lucide-react'

interface TicketModalProps {
  isOpen: boolean
  onClose: () => void
  lastSale: any
  paymentMethod: string
}

export default function TicketModal({ isOpen, onClose, lastSale, paymentMethod }: TicketModalProps) {
  log.info('🎭 TicketModal - isOpen', { isOpen, hasLastSale: !!lastSale })
  
  // Detectar si es dispositivo móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  
  if (!isOpen || !lastSale) {
    log.info('🎭 TicketModal - No se renderiza porque:', !isOpen ? 'isOpen es false' : 'lastSale es null')
    return null
  }

  log.info('🎭 Renderizando modal del ticket...')
  log.info('📊 Datos en modal:', lastSale)
  log.info('📱 Es dispositivo móvil:', isMobile)

  // Calcular valores
  const subtotal = lastSale.subtotal || lastSale.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
  const total = lastSale.total || subtotal
  const tax = subtotal * 0.16
  const realSubtotal = total - tax

  const handlePrint = () => {
    window.print()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{maxHeight: '90vh', overflowY: 'auto'}}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🖨️ Ticket de Venta</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              style={{minWidth: '44px', minHeight: '44px'}}
            >
              ✕
            </button>
          </div>
          
          {/* Contenido del Ticket */}
          <div className="font-mono text-xs bg-white p-4 rounded-lg border-2 border-gray-600 w-full mx-auto" style={{fontFamily: 'Courier New, monospace', maxWidth: '100%', overflowX: 'auto'}}>
            {/* Logo y Header */}
            <div className="text-center mb-4">
              <div className="text-3xl mb-2"><img src="/logos/diseno-sin-titulo-5.png" alt="" /></div>
              <div className="text-lg font-bold mb-1" style={{fontFamily: 'serif'}}>Garras Felinas</div>
              <div className="text-base font-bold mb-2">GARRAS FELINAS</div>
              <div className="text-xs text-gray-600">Venta Física</div>
            </div>
            
            {/* Información del negocio */}
            <div className="text-center mb-4 border-b-2 border-black pb-3">
              <div className="text-xs text-gray-600 mb-1">andador 20 de noviembre, Zapopan</div>
              <div className="text-xs text-gray-600 mb-1">Tel: +52 (555) 123-4567</div>
              <div className="text-xs text-gray-600 mb-1">info@garrasfelinas.com</div>
              <div className="text-xs text-gray-600">RFC: GAR-123456-ABC</div>
            </div>
            
            {/* Línea punteada */}
            <div className="border-t border-dotted border-black my-3"></div>
            
            {/* Detalles de la transacción */}
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-1">Fecha: {new Date().toLocaleString('es-MX')}</div>
              <div className="text-xs text-gray-600 mb-1">Ticket #: {lastSale.id}</div>
              <div className="text-xs text-gray-600">Cajero: Admin</div>
            </div>
            
            {/* Línea punteada */}
            <div className="border-t border-dotted border-black my-3"></div>
            
            {/* Productos */}
            {lastSale.items.map((item: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs">{item.product?.name || 'Producto'} x{item.quantity}</span>
                  <span className="text-xs font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 ml-2 mb-2">
                  SKU: {item.product?.sku || 'N/A'} | ${item.price.toFixed(2)} c/u
                </div>
              </div>
            ))}
            
            {/* Línea punteada */}
            <div className="border-t border-dotted border-black my-3"></div>
            
            {/* Totales */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs">Subtotal:</span>
                <span className="text-xs">${realSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-xs">IVA (16%):</span>
                <span className="text-xs">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-bold">TOTAL:</span>
                <span className="text-sm font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Línea punteada */}
            <div className="border-t border-dotted border-black my-3"></div>
            
            {/* Método de pago e información legal */}
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-1">Método de pago: {paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</div>
              <div className="text-xs text-gray-500">Este documento es un comprobante fiscal</div>
            </div>
            
            {/* Línea punteada */}
            <div className="border-t border-dotted border-black my-3"></div>
            
            {/* Footer */}
            <div className="text-center mt-4">
              <div className="text-xs font-bold mb-1">¡Gracias por su compra!</div>
              <div className="text-xs text-gray-600 mb-1">www.garrasfelinas.com</div>
              <div className="text-xs text-gray-500">Conserve este ticket para garantias y devoluciones</div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              style={{minHeight: '48px'}}
            >
              Cerrar
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              style={{minHeight: '48px'}}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
