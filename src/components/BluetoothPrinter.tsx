'use client'

import { useState, useRef } from 'react'
import { Printer, Bluetooth, AlertCircle, CheckCircle, Settings } from 'lucide-react'

interface BluetoothPrinterProps {
  onPrint?: (data: string) => void
  ticketData?: string
}

export default function BluetoothPrinter({ onPrint, ticketData }: BluetoothPrinterProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedService, setSelectedService] = useState('auto')
  const deviceRef = useRef<BluetoothDevice | null>(null)
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)

  // Verificar si Web Bluetooth está disponible
  const isWebBluetoothSupported = () => {
    return 'bluetooth' in navigator && navigator.bluetooth !== undefined
  }

  // Servicios comunes de impresoras Bluetooth
  const printerServices = {
    auto: 'Detección automática',
    thermal: '000018f0-0000-1000-8000-00805f9b34fb', // Servicio térmico común
    serial: '0000ffe0-0000-1000-8000-00805f9b34fb', // Servicio serial
    spp: '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
    custom: '0000ffe0-0000-1000-8000-00805f9b34fb' // Servicio personalizado
  }

  // Características comunes para escritura
  const writeCharacteristics = [
    '00002af1-0000-1000-8000-00805f9b34fb', // Característica común
    '0000ffe1-0000-1000-8000-00805f9b34fb', // Característica serial
    '0000ffe2-0000-1000-8000-00805f9b34fb'  // Característica alternativa
  ]

  // Conectar a la impresora Bluetooth
  const connectToPrinter = async () => {
    if (!isWebBluetoothSupported()) {
      setError('Web Bluetooth no está soportado en este navegador')
      return
    }

    try {
      setIsPrinting(true)
      setError(null)

      // Configurar filtros según el servicio seleccionado
      let filters: any[] = []
      let optionalServices: string[] = []

      if (selectedService === 'auto') {
        // Detección automática con múltiples filtros
        filters = [
          // Por nombre
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'Receipt' },
          { namePrefix: 'Ticket' },
          { namePrefix: 'BT' },
          { namePrefix: 'Bluetooth' },
          // Por servicios conocidos
          { services: [printerServices.thermal] },
          { services: [printerServices.serial] },
          { services: [printerServices.spp] }
        ]
        optionalServices = Object.values(printerServices).filter(v => v !== 'auto')
      } else {
        // Servicio específico
        const serviceId = printerServices[selectedService as keyof typeof printerServices]
        filters = [{ services: [serviceId] }]
        optionalServices = [serviceId]
      }

      // Solicitar dispositivo Bluetooth
      const device = await navigator.bluetooth!.requestDevice({
        filters,
        optionalServices
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

      // Buscar el servicio correcto
      let service = null
      if (selectedService === 'auto') {
        // Intentar encontrar cualquier servicio de impresora
        for (const serviceId of Object.values(printerServices)) {
          if (serviceId === 'auto') continue
          try {
            service = await server.getPrimaryService(serviceId)
            break
          } catch (e) {
            console.log(`Servicio ${serviceId} no encontrado, intentando siguiente...`)
          }
        }
      } else {
        const serviceId = printerServices[selectedService as keyof typeof printerServices]
        service = await server.getPrimaryService(serviceId)
      }

      if (!service) {
        throw new Error('No se encontró ningún servicio de impresora compatible')
      }

      // Buscar la característica de escritura correcta
      let characteristic = null
      for (const charId of writeCharacteristics) {
        try {
          characteristic = await service.getCharacteristic(charId)
          break
        } catch (e) {
          console.log(`Característica ${charId} no encontrada, intentando siguiente...`)
        }
      }

      if (!characteristic) {
        // Si no encontramos las características conocidas, intentar con todas las disponibles
        const characteristics = await service.getCharacteristics()
        characteristic = characteristics.find(char => 
          char.properties.write || char.properties.writeWithoutResponse
        ) || null
      }

      if (!characteristic) {
        throw new Error('No se encontró una característica de escritura compatible')
      }

      characteristicRef.current = characteristic

      setIsConnected(true)
      setDeviceName(device.name || 'Impresora Bluetooth')
      setError(null)

      console.log('Conectado exitosamente:', {
        deviceName: device.name,
        serviceId: service.uuid,
        characteristicId: characteristic.uuid,
        properties: characteristic.properties
      })

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
      if (characteristicRef.current.properties.writeWithoutResponse) {
        await characteristicRef.current.writeValueWithoutResponse(data)
      } else {
        await characteristicRef.current.writeValue(data)
      }

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
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="ml-auto flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <Settings className="h-4 w-4" />
          {showAdvanced ? 'Ocultar' : 'Avanzado'}
        </button>
      </div>

      {/* Configuración avanzada */}
      {showAdvanced && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de servicio:
          </label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(printerServices).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-600">
            Si la detección automática no funciona, selecciona el tipo específico de tu impresora.
          </p>
        </div>
      )}

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

      {/* Consejos de conexión */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
        <strong>Consejos para conectar:</strong>
        <ul className="mt-1 list-disc list-inside space-y-1">
          <li>Asegúrate de que la impresora esté en modo de emparejamiento</li>
          <li>Verifica que Bluetooth esté activado en tu dispositivo</li>
          <li>Si no aparece, intenta con diferentes tipos de servicio en "Avanzado"</li>
          <li>Algunas impresoras requieren estar a menos de 1 metro de distancia</li>
        </ul>
      </div>
    </div>
  )
}

