'use client'

import { useState } from 'react'
import BluetoothPrinter from '@/components/BluetoothPrinter'
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter'
import { Printer, FileText, Settings } from 'lucide-react'

export default function ImpresoraPage() {
  const [ticketData, setTicketData] = useState('')
  const [testMode, setTestMode] = useState(false)
  
  const {
    isConnected,
    isPrinting,
    error,
    deviceName,
    connect,
    disconnect,
    print,
    clearError
  } = useBluetoothPrinter()

  // Generar ticket de prueba
  const generateTestTicket = () => {
    const testTicket = `
================================
        GARRAS FELINAS
================================

Fecha: ${new Date().toLocaleDateString()}
Hora: ${new Date().toLocaleTimeString()}
Ticket: #${Math.random().toString(36).substr(2, 9).toUpperCase()}

================================
PRODUCTO                    PRECIO
================================
Blusa Floral                 $299.00
Pantalón Negro              $450.00
Zapatos Deportivos          $599.00

================================
SUBTOTAL:                   $1,348.00
IVA (16%):                  $215.68
TOTAL:                      $1,563.68

================================
Método de Pago: Tarjeta
Últimos 4 dígitos: ****1234

================================
¡Gracias por tu compra!
🐾 Garras Felinas 🐾
================================

    `
    setTicketData(testTicket)
  }

  // Imprimir ticket
  const handlePrint = async () => {
    if (!ticketData.trim()) {
      alert('No hay datos para imprimir')
      return
    }
    await print(ticketData)
  }

  return (
    <div className="min-h-screen bg-gradient-elegant p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Printer className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Configuración de Impresora</h1>
          </div>
          <p className="text-gray-600">
            Conecta tu impresora Bluetooth térmica para imprimir tickets directamente desde el navegador.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Control */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Control de Impresora</h2>
            </div>

            {/* Estado de conexión */}
            <div className="mb-4 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estado:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  isConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              {deviceName && (
                <div className="mt-2 text-sm text-gray-600">
                  Dispositivo: {deviceName}
                </div>
              )}
            </div>

            {/* Botones de control */}
            <div className="space-y-3">
              {!isConnected ? (
                <button
                  onClick={connect}
                  disabled={isPrinting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Printer className="h-4 w-4" />
                  {isPrinting ? 'Conectando...' : 'Conectar Impresora'}
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Desconectar
                </button>
              )}

              {/* Generar ticket de prueba */}
              <button
                onClick={generateTestTicket}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FileText className="h-4 w-4" />
                Generar Ticket de Prueba
              </button>

              {/* Imprimir */}
              <button
                onClick={handlePrint}
                disabled={!isConnected || !ticketData || isPrinting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Printer className="h-4 w-4" />
                {isPrinting ? 'Imprimiendo...' : 'Imprimir Ticket'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Editor de Ticket */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Editor de Ticket</h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido del Ticket:
              </label>
              <textarea
                value={ticketData}
                onChange={(e) => setTicketData(e.target.value)}
                placeholder="Ingresa el contenido del ticket aquí..."
                className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTicketData('')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Limpiar
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(ticketData)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copiar
              </button>
            </div>
          </div>
        </div>

        {/* Información de compatibilidad */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">📱 Requisitos para Impresión Bluetooth:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Navegador compatible: Chrome, Edge, Opera (Android)</li>
            <li>• Conexión HTTPS (requerido para Web Bluetooth)</li>
            <li>• Impresora térmica Bluetooth compatible</li>
            <li>• Permisos de Bluetooth habilitados</li>
          </ul>
        </div>
      </div>
    </div>
  )
}



