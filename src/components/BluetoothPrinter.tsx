'use client'

import { useState, useRef } from 'react'
import { Printer, Bluetooth, AlertCircle, CheckCircle } from 'lucide-react'

interface BluetoothPrinterProps {
  onPrint?: (data: string) => void
  ticketData?: string
}

export default function BluetoothPrinter({ onPrint, ticketData }: BluetoothPrinterProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const deviceRef = useRef<BluetoothDevice | null>(null)
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)

  // Verificar si Web Bluetooth está disponible
  const isWebBluetoothSupported = () => {
    return 'bluetooth' in navigator && navigator.bluetooth !== undefined
  }

  // Conectar a la impresora Bluetooth
  const connectToPrinter = async () => {
    if (!isWebBluetoothSupported()) {
      setError('Web Bluetooth no está soportado en este navegador')
      return
    }

    try {
      setIsPrinting(true)
      setError(null)

      // Solicitar dispositivo Bluetooth
      const device = await navigator.bluetooth!.requestDevice({
        filters: [
          {
            services: ['000018f0-0000-1000-8000-00805f9b34fb'] // Servicio común de impresoras
          },
          {
            namePrefix: 'Printer'
          },
          {
            namePrefix: 'POS'
          },
          {
            namePrefix: 'Thermal'
          }
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      })

      deviceRef.current = device

      // Escuchar eventos de desconexión
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false)
        setDeviceName(null)
        setError('Dispositivo desconectado')
      })

      // Conectar al servidor GATT
      const server = await device.gatt?.connect()
      if (!server) {
        throw new Error('No se pudo conectar al servidor GATT')
      }

      // Obtener el servicio
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
      
      // Obtener la característica para escritura
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')
      characteristicRef.current = characteristic

      setIsConnected(true)
      setDeviceName(device.name || 'Impresora Bluetooth')
      setError(null)

    } catch (err) {
      console.error('Error al conectar:', err)
      setError(err instanceof Error ? err.message : 'Error al conectar')
      setIsConnected(false)
    } finally {
      setIsPrinting(false)
    }
  }

  // Imprimir ticket
  const printTicket = async () => {
    if (!isConnected || !characteristicRef.current) {
      setError('No hay conexión con la impresora')
      return
    }

    if (!ticketData) {
      setError('No hay datos para imprimir')
      return
    }

    try {
      setIsPrinting(true)
      setError(null)

      // Convertir texto a bytes (UTF-8)
      const encoder = new TextEncoder()
      const data = encoder.encode(ticketData)

      // Enviar datos a la impresora
      await characteristicRef.current.writeValue(data)

      // Llamar callback si existe
      if (onPrint) {
        onPrint(ticketData)
      }

    } catch (err) {
      console.error('Error al imprimir:', err)
      setError(err instanceof Error ? err.message : 'Error al imprimir')
    } finally {
      setIsPrinting(false)
    }
  }

  // Desconectar
  const disconnect = () => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect()
    }
    setIsConnected(false)
    setDeviceName(null)
    deviceRef.current = null
    characteristicRef.current = null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Printer className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Impresora Bluetooth</h3>
      </div>

      {/* Estado de conexión */}
      <div className="mb-4">
        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Conectado a: {deviceName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="h-5 w-5" />
            <span>No conectado</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        {!isConnected ? (
          <button
            onClick={connectToPrinter}
            disabled={isPrinting || !isWebBluetoothSupported()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bluetooth className="h-4 w-4" />
            {isPrinting ? 'Conectando...' : 'Conectar Impresora'}
          </button>
        ) : (
          <>
            <button
              onClick={printTicket}
              disabled={isPrinting || !ticketData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? 'Imprimiendo...' : 'Imprimir Ticket'}
            </button>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Desconectar
            </button>
          </>
        )}
      </div>

      {/* Información de compatibilidad */}
      {!isWebBluetoothSupported() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
          <strong>Nota:</strong> Web Bluetooth requiere HTTPS y un navegador compatible (Chrome, Edge, Opera).
        </div>
      )}
    </div>
  )
}

