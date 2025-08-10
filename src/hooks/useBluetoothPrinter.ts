import { useState, useRef, useCallback } from 'react'

interface UseBluetoothPrinterReturn {
  isConnected: boolean
  isPrinting: boolean
  error: string | null
  deviceName: string | null
  connect: () => Promise<void>
  disconnect: () => void
  print: (data: string) => Promise<void>
  isSupported: boolean
}

export function useBluetoothPrinter(): UseBluetoothPrinterReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const deviceRef = useRef<BluetoothDevice | null>(null)
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)

  // Verificar si Web Bluetooth está disponible
  const isSupported = useCallback(() => {
    return 'bluetooth' in navigator && navigator.bluetooth !== undefined
  }, [])

  // Servicios comunes de impresoras Bluetooth
  const printerServices = {
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
  const connect = useCallback(async () => {
    if (!isSupported()) {
      setError('Web Bluetooth no está soportado en este navegador')
      return
    }

    try {
      setIsPrinting(true)
      setError(null)

      // Detección automática con múltiples filtros
      const filters = [
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

      const optionalServices = Object.values(printerServices)

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
      for (const serviceId of Object.values(printerServices)) {
        try {
          service = await server.getPrimaryService(serviceId)
          break
        } catch (e) {
          console.log(`Servicio ${serviceId} no encontrado, intentando siguiente...`)
        }
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
  }, [isSupported])

  // Imprimir datos
  const print = useCallback(async (data: string) => {
    if (!isConnected || !characteristicRef.current) {
      setError('No hay conexión con la impresora')
      return
    }

    if (!data) {
      setError('No hay datos para imprimir')
      return
    }

    try {
      setIsPrinting(true)
      setError(null)

      // Convertir texto a bytes (UTF-8)
      const encoder = new TextEncoder()
      const bytes = encoder.encode(data)

      // Enviar datos a la impresora
      if (characteristicRef.current.properties.writeWithoutResponse) {
        await characteristicRef.current.writeValueWithoutResponse(bytes)
      } else {
        await characteristicRef.current.writeValue(bytes)
      }

    } catch (err) {
      console.error('Error al imprimir:', err)
      setError(err instanceof Error ? err.message : 'Error al imprimir')
    } finally {
      setIsPrinting(false)
    }
  }, [isConnected])

  // Desconectar
  const disconnect = useCallback(() => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect()
    }
    setIsConnected(false)
    setDeviceName(null)
    deviceRef.current = null
    characteristicRef.current = null
  }, [])

  return {
    isConnected,
    isPrinting,
    error,
    deviceName,
    connect,
    disconnect,
    print,
    isSupported: isSupported()
  }
}

