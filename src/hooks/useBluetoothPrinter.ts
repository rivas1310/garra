import { useState, useRef, useCallback } from 'react'

interface BluetoothPrinterState {
  isConnected: boolean
  isPrinting: boolean
  error: string | null
  deviceName: string | null
}

interface UseBluetoothPrinterReturn extends BluetoothPrinterState {
  connect: () => Promise<void>
  disconnect: () => void
  print: (data: string) => Promise<void>
  clearError: () => void
}

export function useBluetoothPrinter(): UseBluetoothPrinterReturn {
  const [state, setState] = useState<BluetoothPrinterState>({
    isConnected: false,
    isPrinting: false,
    error: null,
    deviceName: null
  })

  const deviceRef = useRef<BluetoothDevice | null>(null)
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)

  // Verificar compatibilidad
  const isSupported = useCallback(() => {
    return 'bluetooth' in navigator && navigator.bluetooth !== undefined
  }, [])

  // Conectar a la impresora
  const connect = useCallback(async () => {
    if (!isSupported()) {
      setState(prev => ({ ...prev, error: 'Web Bluetooth no está soportado' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isPrinting: true, error: null }))

      // Solicitar dispositivo
      const device = await navigator.bluetooth!.requestDevice({
        filters: [
          // Filtros comunes para impresoras térmicas
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'BT' },
          { namePrefix: 'ZJ' },
          { namePrefix: 'GP' },
          { namePrefix: 'SP' }
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Servicio común
          '0000ffe0-0000-1000-8000-00805f9b34fb', // Servicio alternativo
          '0000ffe5-0000-1000-8000-00805f9b34fb'  // Otro servicio común
        ]
      })

      deviceRef.current = device

      // Manejar desconexión
      device.addEventListener('gattserverdisconnected', () => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          deviceName: null,
          error: 'Dispositivo desconectado'
        }))
      })

      // Conectar al servidor GATT
      const server = await device.gatt?.connect()
      if (!server) {
        throw new Error('No se pudo conectar al servidor GATT')
      }

      // Buscar servicio compatible
      let service = null
      const serviceUUIDs = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '0000ffe0-0000-1000-8000-00805f9b34fb',
        '0000ffe5-0000-1000-8000-00805f9b34fb'
      ]

      for (const uuid of serviceUUIDs) {
        try {
          service = await server.getPrimaryService(uuid)
          break
        } catch (e) {
          continue
        }
      }

      if (!service) {
        throw new Error('No se encontró un servicio compatible')
      }

      // Buscar característica de escritura
      const characteristics = await service.getCharacteristics()
      const writeCharacteristic = characteristics.find(char => 
        char.properties.write || char.properties.writeWithoutResponse
      )

      if (!writeCharacteristic) {
        throw new Error('No se encontró característica de escritura')
      }

      characteristicRef.current = writeCharacteristic

      setState(prev => ({
        ...prev,
        isConnected: true,
        deviceName: device.name || 'Impresora Bluetooth',
        error: null,
        isPrinting: false
      }))

    } catch (err) {
      console.error('Error al conectar:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al conectar',
        isPrinting: false
      }))
    }
  }, [isSupported])

  // Desconectar
  const disconnect = useCallback(() => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect()
    }
    deviceRef.current = null
    characteristicRef.current = null
    setState(prev => ({
      ...prev,
      isConnected: false,
      deviceName: null
    }))
  }, [])

  // Imprimir
  const print = useCallback(async (data: string) => {
    if (!state.isConnected || !characteristicRef.current) {
      setState(prev => ({ ...prev, error: 'No hay conexión con la impresora' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isPrinting: true, error: null }))

      // Convertir texto a bytes
      const encoder = new TextEncoder()
      const bytes = encoder.encode(data)

      // Enviar datos
      await characteristicRef.current.writeValue(bytes)

      setState(prev => ({ ...prev, isPrinting: false }))

    } catch (err) {
      console.error('Error al imprimir:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al imprimir',
        isPrinting: false
      }))
    }
  }, [state.isConnected])

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    connect,
    disconnect,
    print,
    clearError
  }
}

