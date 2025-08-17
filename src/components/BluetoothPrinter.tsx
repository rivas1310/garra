'use client'

import { useState } from 'react'
import { log } from '@/lib/secureLogger'
import { Printer, Bluetooth, AlertCircle, CheckCircle, Settings, Search } from 'lucide-react'
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter'

interface BluetoothPrinterProps {
  onPrint?: (data: string) => void
  ticketData?: string
}

export default function BluetoothPrinter({ onPrint, ticketData }: BluetoothPrinterProps) {
  const {
    isConnected,
    isPrinting,
    error,
    deviceName,
    debugInfo,
    connect,
    disconnect,
    print,
    isSupported
  } = useBluetoothPrinter()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  // Función para escanear dispositivos sin conectar
  const scanDevices = async () => {
    if (!isSupported) {
      alert('Web Bluetooth no está soportado en este navegador')
      return
    }

    try {
      // Escanear dispositivos con filtros específicos
      const device = await navigator.bluetooth!.requestDevice({
        filters: [
          { namePrefix: 'Thermal' },
          { namePrefix: 'Receipt' },
          { namePrefix: 'Ticket' },
          { namePrefix: 'Printer' },
          { namePrefix: 'TM-' },
          { namePrefix: 'ZJ-' },
          { namePrefix: 'GP-' },
          { namePrefix: 'SP-' },
          { namePrefix: 'POS' },
          { namePrefix: 'ESC' },
          { namePrefix: 'PT-' },
          { namePrefix: 'PT' },
          { namePrefix: 'BT-' },
          { namePrefix: 'BLE' },
          { namePrefix: 'Bixolon' },
          { namePrefix: 'Star' },
          { namePrefix: 'Citizen' },
          { namePrefix: 'Epson' },
          { namePrefix: 'Brother' }
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Térmico
          '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
          '0000ffe0-0000-1000-8000-00805f9b34fb', // SPP
          '0000ffe1-0000-1000-8000-00805f9b34fb', // Característica SPP
          '0000ff00-0000-1000-8000-00805f9b34fb', // Custom service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // HM-10 service
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART service
          '12345678-1234-1234-1234-123456789abc', // Generic custom service
          'generic_access',
          'generic_attribute',
          'device_information',
          'battery_service'
        ]
      })

      log.error(`📱 Dispositivo encontrado: ${device.name || 'Sin nombre'} (${device.id})`)

      // Intentar conectar temporalmente para obtener información
      try {
        const server = await device.gatt?.connect()
        if (server) {
          log.error('🔧 Conectado temporalmente para obtener información')
          
          // Intentar obtener servicios conocidos
          const knownServices = [
            '000018f0-0000-1000-8000-00805f9b34fb',
            '00001101-0000-1000-8000-00805f9b34fb',
            '0000ffe0-0000-1000-8000-00805f9b34fb'
          ]
          
          log.error('📋 Verificando servicios conocidos...')
          for (const serviceUuid of knownServices) {
             try {
               const service = await server.getPrimaryService(serviceUuid)
               log.error(`  ✅ Servicio encontrado: ${serviceUuid}`)
              
              try {
                 const characteristics = await service.getCharacteristics()
                 log.error(`    Características encontradas: ${characteristics.length}`)
               } catch (e) {
                 log.error(`    ❌ Error al obtener características: ${e}`)
               }
            } catch (e) {
              log.error(`  ❌ Servicio ${serviceUuid} no disponible`)
            }
          }
          
          server.disconnect()
          log.error('🔌 Desconectado del escaneo')
        }
      } catch (e) {
        log.error(`⚠️ No se pudo conectar para obtener información: ${e}`)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      log.error(`Error de escaneo: ${errorMessage}`)
      alert(`Error de escaneo: ${errorMessage}`)
    }
  }

  // Función para imprimir ticket
  const printTicket = async () => {
    if (!isConnected) {
      alert('No hay conexión con la impresora')
      return
    }

    if (!ticketData) {
      alert('No hay datos de ticket para imprimir')
      return
    }

    try {
      await print(ticketData)
      log.error('✅ Ticket impreso exitosamente')
      onPrint?.(ticketData)
    } catch (err) {
      log.error('Error al imprimir:', err)
      alert(`Error al imprimir: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  // Limpiar información de depuración
  const clearDebugInfo = () => {
    // La información de debug se maneja en el hook
    log.error('Información de debug limpiada')
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Web Bluetooth no soportado</span>
        </div>
        <p className="text-sm text-red-600 mt-2">
          Tu navegador no soporta Web Bluetooth. Usa Chrome, Edge u Opera.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estado de conexión */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div>
            <p className="font-medium">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </p>
            {deviceName && (
              <p className="text-sm text-gray-600">{deviceName}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <Settings className="h-4 w-4" />
            Avanzado
          </button>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            <Search className="h-4 w-4" />
            Debug
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error:</span>
          </div>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Información de debug */}
      {showDebug && debugInfo.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Información de Debug</h4>
            <button
              onClick={clearDebugInfo}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-xs font-mono text-gray-600 bg-white p-2 rounded">
                {info}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opciones avanzadas */}
      {showAdvanced && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Opciones Avanzadas</h4>
          <div className="space-y-3">
            <button
              onClick={scanDevices}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="h-4 w-4" />
              {isPrinting ? 'Escaneando...' : 'Escanear Dispositivos'}
            </button>
            <p className="text-sm text-blue-700">
              Escanea todos los dispositivos Bluetooth para diagnosticar problemas de conexión.
            </p>
          </div>
        </div>
      )}

      {/* Botones de control */}
      <div className="flex gap-3">
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isPrinting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Bluetooth className="h-4 w-4" />
            {isPrinting ? 'Conectando...' : 'Conectar Impresora'}
          </button>
        ) : (
          <>
            <button
              onClick={disconnect}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Desconectar
            </button>
            <button
              onClick={printTicket}
              disabled={isPrinting || !ticketData}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? 'Imprimiendo...' : 'Imprimir Ticket'}
            </button>
          </>
        )}
      </div>

      {/* Información de compatibilidad */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
        <h4 className="font-medium mb-1">📱 Requisitos:</h4>
        <ul className="space-y-1">
          <li>• Navegador: Chrome, Edge, Opera</li>
          <li>• Conexión HTTPS</li>
          <li>• Bluetooth habilitado</li>
          <li>• Impresora térmica compatible</li>
        </ul>
      </div>
    </div>
  )
}

