import { useState, useRef, useCallback } from 'react'

// Helper function for chunked data transmission
async function sendDataInChunks(
  allBytes: Uint8Array, 
  characteristic: BluetoothRemoteGATTCharacteristic, 
  addDebugInfo: (message: string, data?: any) => void,
  deviceName: string = ''
) {
  // Detectar PT-210 para usar estrategia ultra-conservadora
  const isPT210 = deviceName.includes('PT-210') || deviceName.includes('PT_210')
  
  const chunkSize = isPT210 ? 128 : 256 // Chunks más pequeños para PT-210
  const delay = isPT210 ? 300 : 200 // Delays más largos para PT-210
  
  addDebugInfo(`📦 Estrategia ${isPT210 ? 'PT-210' : 'estándar'}: chunks de ${chunkSize} bytes con delay de ${delay}ms`)
  
  const chunks = []
  for (let i = 0; i < allBytes.length; i += chunkSize) {
    chunks.push(allBytes.slice(i, i + chunkSize))
  }

  addDebugInfo(`📦 Dividiendo en ${chunks.length} chunks`)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    addDebugInfo(`📤 Enviando chunk ${i + 1}/${chunks.length} (${chunk.length} bytes)`)
    
    let retries = isPT210 ? 3 : 1 // Más reintentos para PT-210
    let success = false
    
    while (retries > 0 && !success) {
      try {
        if (characteristic.properties.writeWithoutResponse || characteristic.properties.write) {
          await characteristic.writeValue(chunk)
        } else {
          throw new Error('La característica no soporta escritura')
        }
        
        success = true
        addDebugInfo(`✅ Chunk ${i + 1} enviado exitosamente`)
        
      } catch (chunkError) {
        retries--
        addDebugInfo(`⚠️ Error en chunk ${i + 1}, reintentos restantes: ${retries}`)
        
        if (retries === 0) {
          addDebugInfo(`❌ Error final enviando chunk ${i + 1}: ${chunkError instanceof Error ? chunkError.message : 'Error desconocido'}`)
          throw new Error(`Error en chunk ${i + 1}: ${chunkError instanceof Error ? chunkError.message : 'Error desconocido'}`)
        }
        
        // Pausa antes de reintentar
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // Pausa entre chunks exitosos
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  addDebugInfo('✅ Todos los chunks enviados exitosamente')
}

interface UseBluetoothPrinterReturn {
  isConnected: boolean
  isPrinting: boolean
  error: string | null
  deviceName: string | null
  debugInfo: string[]
  connect: () => Promise<void>
  disconnect: () => void
  print: (data: string) => Promise<void>
  clearError: () => void
  isSupported: boolean
}

export function useBluetoothPrinter(): UseBluetoothPrinterReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const deviceRef = useRef<BluetoothDevice | null>(null)
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)

  // Verificar soporte
  const isSupported = useCallback(() => {
    return !!(navigator.bluetooth && navigator.bluetooth.requestDevice)
  }, [])

  // Agregar información de debug
  const addDebugInfo = useCallback((info: string, data?: any) => {
    const message = data ? `${info} ${JSON.stringify(data)}` : info
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(`🔍 DEBUG: ${message}`)
  }, [])

  // Conectar a la impresora con múltiples estrategias
  const connect = useCallback(async () => {
    if (!isSupported()) {
      setError('Web Bluetooth no está soportado en este navegador')
      return
    }

    try {
      setIsPrinting(true)
      setError(null)
      setDebugInfo([])

      addDebugInfo('🚀 Iniciando conexión Bluetooth con múltiples estrategias...')

      // Estrategia 1: Intentar con filtros específicos de impresoras
      let device: BluetoothDevice | null = null
      let connectionStrategy = ''

      // Estrategia 1: Filtros específicos de impresoras
      try {
        addDebugInfo('📡 Estrategia 1: Filtros específicos de impresoras')
        
        const filters = [
          // Impresoras térmicas comunes
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
          // Impresoras PT-210 y similares
          { namePrefix: 'PT-' },
          { namePrefix: 'PT' },
          { namePrefix: 'BT-' },
          { namePrefix: 'BLE' },
          // Impresoras específicas
          { namePrefix: 'Bixolon' },
          { namePrefix: 'Star' },
          { namePrefix: 'Citizen' },
          { namePrefix: 'Epson' },
          { namePrefix: 'Brother' },
          // Dispositivos genéricos
          { name: 'Bluetooth Printer' },
          { name: 'Thermal Printer' }
        ]

        const optionalServices = [
          // Servicios estándar de impresoras térmicas
          '000018f0-0000-1000-8000-00805f9b34fb', // Servicio térmico genérico
          '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
          '0000ffe0-0000-1000-8000-00805f9b34fb', // Servicio SPP
          '0000ffe1-0000-1000-8000-00805f9b34fb', // Característica SPP
          '0000ff00-0000-1000-8000-00805f9b34fb', // Custom service
          // Servicios específicos para PT-210 y similares
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // HM-10 service
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART service
          '12345678-1234-1234-1234-123456789abc', // Generic custom service
          // Servicios genéricos
          'generic_access',
          'generic_attribute',
          'device_information',
          'battery_service'
        ]

        device = await navigator.bluetooth!.requestDevice({
          filters,
          optionalServices
        })
        
        connectionStrategy = 'Filtros específicos'
        addDebugInfo(`✅ Dispositivo encontrado con ${connectionStrategy}: ${device.name}`)
      } catch (err) {
        addDebugInfo(`❌ Estrategia 1 falló: ${err instanceof Error ? err.message : 'Error desconocido'}`)
      }

      // Estrategia 2: Aceptar todos los dispositivos
      if (!device) {
        try {
          addDebugInfo('📡 Estrategia 2: Aceptar todos los dispositivos')
          
          device = await navigator.bluetooth!.requestDevice({
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
          
          connectionStrategy = 'Todos los dispositivos'
          addDebugInfo(`✅ Dispositivo encontrado con ${connectionStrategy}: ${device.name}`)
        } catch (err) {
          addDebugInfo(`❌ Estrategia 2 falló: ${err instanceof Error ? err.message : 'Error desconocido'}`)
        }
      }

      if (!device) {
        throw new Error('No se pudo encontrar ningún dispositivo Bluetooth')
      }

      addDebugInfo(`📱 Dispositivo seleccionado: ${device.name} (${device.id})`)
      addDebugInfo(`🎯 Estrategia utilizada: ${connectionStrategy}`)

      if (!device.gatt) {
        throw new Error('El dispositivo no soporta GATT. Puede ser una impresora Bluetooth Classic.')
      }

      addDebugInfo('🔧 Conectando al servidor GATT...')
      const server = await device.gatt.connect()
      addDebugInfo('✅ Servidor GATT conectado')

      // Buscar servicios compatibles conocidos
      const knownServiceUuids = [
        '000018f0-0000-1000-8000-00805f9b34fb', // Térmico
        '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
        '0000ffe0-0000-1000-8000-00805f9b34fb', // SPP
        '0000ffe1-0000-1000-8000-00805f9b34fb', // Característica SPP
        '0000ff00-0000-1000-8000-00805f9b34fb', // Custom service
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // HM-10 service
        '6e400001-b5a3-f393-e0a9-e50e24dcca9e' // Nordic UART service
      ]
      
      const availableServices: BluetoothRemoteGATTService[] = []
      addDebugInfo('📋 Verificando servicios conocidos...')
      
      for (const serviceUuid of knownServiceUuids) {
        try {
          const service = await server.getPrimaryService(serviceUuid)
          availableServices.push(service)
          addDebugInfo(`  ✅ Servicio encontrado: ${serviceUuid}`)
        } catch (e) {
          addDebugInfo(`  ❌ Servicio ${serviceUuid} no disponible`)
        }
      }
      
      addDebugInfo(`📋 Total de servicios disponibles: ${availableServices.length}`)

      let targetService: BluetoothRemoteGATTService | null = null
      let targetCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

      // Detectar si es una impresora PT-210 para optimizaciones específicas
      const isPT210 = device.name?.includes('PT-210') || device.name?.includes('PT_210')
      if (isPT210) {
        addDebugInfo('🎯 Impresora PT-210 detectada - aplicando optimizaciones específicas')
      }

      // Intentar diferentes servicios en orden de prioridad
      const servicePriorities = isPT210 ? [
        // Para PT-210, priorizar HM-10 y servicios custom
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // HM-10 service (común en PT-210)
        '0000ffe0-0000-1000-8000-00805f9b34fb', // SPP
        '0000ff00-0000-1000-8000-00805f9b34fb', // Custom service
        '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART service
        '000018f0-0000-1000-8000-00805f9b34fb', // Térmico
        'generic_access',
        'generic_attribute'
      ] : [
        '000018f0-0000-1000-8000-00805f9b34fb', // Térmico
        '0000ffe0-0000-1000-8000-00805f9b34fb', // SPP
        'generic_access',
        'generic_attribute'
      ]

      for (let i = 0; i < availableServices.length; i++) {
        const service = availableServices[i]
        const serviceUuid = knownServiceUuids[i] || 'unknown'
        addDebugInfo(`🔍 Verificando servicio: ${serviceUuid}`)
        
        if (servicePriorities.includes(serviceUuid.toLowerCase())) {
          targetService = service
          addDebugInfo(`✅ Servicio prioritario seleccionado: ${serviceUuid}`)
          break
        }
      }

      // Si no encontramos un servicio prioritario, usar el primero disponible
      if (!targetService && availableServices.length > 0) {
        targetService = availableServices[0]
        addDebugInfo(`⚠️ Usando primer servicio disponible`)
      }

      if (!targetService) {
        throw new Error('No se encontró ningún servicio compatible')
      }

      // Buscar características de escritura
      const characteristics = await targetService.getCharacteristics()
      addDebugInfo(`📝 Encontradas ${characteristics.length} características`)

      // Mostrar todas las características para diagnóstico
      characteristics.forEach((characteristic, index) => {
        addDebugInfo(`  - Característica ${index + 1}`)
        addDebugInfo(`    Propiedades: ${JSON.stringify(characteristic.properties)}`)
      })

      // Para PT-210, priorizar writeWithoutResponse
      if (isPT210) {
        for (let i = 0; i < characteristics.length; i++) {
          const characteristic = characteristics[i]
          addDebugInfo(`🔍 Verificando característica ${i + 1}`)
          
          if (characteristic.properties.writeWithoutResponse) {
            targetCharacteristic = characteristic
            addDebugInfo(`✅ Característica writeWithoutResponse seleccionada para PT-210`)
            break
          }
        }
      }
      
      // Si no se encontró writeWithoutResponse o no es PT-210, buscar cualquier característica de escritura
      if (!targetCharacteristic) {
        for (let i = 0; i < characteristics.length; i++) {
          const characteristic = characteristics[i]
          addDebugInfo(`🔍 Verificando característica ${i + 1}`)
          
          if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
            targetCharacteristic = characteristic
            addDebugInfo(`✅ Característica de escritura seleccionada`)
            break
          }
        }
      }

      if (!targetCharacteristic) {
        throw new Error('No se encontró ninguna característica de escritura')
      }

      // Guardar referencias
      deviceRef.current = device
      characteristicRef.current = targetCharacteristic
      setIsConnected(true)
      setDeviceName(device.name || 'Impresora Bluetooth')
      setError(null)

      addDebugInfo('🎉 Conexión establecida exitosamente')
      addDebugInfo(`📊 Resumen de conexión:`)
      addDebugInfo(`   - Dispositivo: ${device.name}`)
      addDebugInfo(`   - Servicio: conectado`)
      addDebugInfo(`   - Característica: conectada`)
      addDebugInfo(`   - Propiedades: ${JSON.stringify(targetCharacteristic.properties)}`)

    } catch (err) {
      console.error('Error al conectar:', err)
      addDebugInfo(`❌ Error de conexión: ${err instanceof Error ? err.message : 'Error desconocido'}`)
      setError(err instanceof Error ? err.message : 'Error al conectar')
      setIsConnected(false)
    } finally {
      setIsPrinting(false)
    }
  }, [isSupported, addDebugInfo])

  // Imprimir datos con manejo robusto de errores
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

      addDebugInfo('🖨️ Iniciando impresión...')

      // Verificar que la característica esté conectada
      if (!deviceRef.current?.gatt?.connected) {
        throw new Error('La conexión Bluetooth se ha perdido. Intenta reconectar.')
      }

      // Convertir texto a bytes (UTF-8)
      const encoder = new TextEncoder()
      const allBytes = encoder.encode(data)

      addDebugInfo(`📄 Preparando envío de ${allBytes.length} bytes`)
      addDebugInfo('🔍 Información de la característica:', {
        properties: characteristicRef.current.properties,
        device: deviceRef.current?.name
      })

      // Detectar PT-210 para estrategia específica
      const deviceName = deviceRef.current?.name || ''
      const isPT210 = deviceName.includes('PT-210') || deviceName.includes('PT_210')
      
      addDebugInfo(`🖨️ Impresora detectada: ${deviceName} ${isPT210 ? '(PT-210 - modo especial)' : '(estándar)'}`)
      
      // Para PT-210: usar siempre chunks pequeños, para otras: intentar envío completo primero
      if (!isPT210 && allBytes.length <= 512) {
        addDebugInfo(`📤 Intentando envío completo (${allBytes.length} bytes)`)
        
        try {
          if (characteristicRef.current.properties.writeWithoutResponse || characteristicRef.current.properties.write) {
            addDebugInfo('📤 Usando writeValue')
            await characteristicRef.current.writeValue(allBytes)
          } else {
            throw new Error('La característica no soporta escritura')
          }
          
          addDebugInfo('✅ Envío completo exitoso')
          return
          
        } catch (singleChunkError) {
          addDebugInfo(`⚠️ Envío completo falló: ${singleChunkError instanceof Error ? singleChunkError.message : 'Error desconocido'}`)
          addDebugInfo('🔄 Cambiando a estrategia de chunks...')
        }
      }
      
      // Usar chunks para PT-210 siempre, o como fallback para otras impresoras
      addDebugInfo(`📦 Usando estrategia de chunks ${isPT210 ? '(PT-210 optimizada)' : '(fallback)'}`)
      await sendDataInChunks(allBytes, characteristicRef.current, addDebugInfo, deviceName)

    } catch (err) {
      console.error('Error al imprimir:', err)
      
      // Manejar errores específicos de GATT
      if (err instanceof Error) {
        if (err.name === 'NotSupportedError') {
          setError('La impresora no soporta esta operación. Verifica que sea compatible con Web Bluetooth.')
        } else if (err.name === 'NetworkError') {
          setError('Error de conexión Bluetooth. Intenta reconectar la impresora.')
        } else if (err.name === 'InvalidStateError') {
          setError('La conexión Bluetooth no está en el estado correcto. Intenta reconectar.')
        } else {
          setError(`Error al imprimir: ${err.message}`)
        }
      } else {
        setError('Error desconocido al imprimir')
      }
    } finally {
      setIsPrinting(false)
    }
  }, [isConnected, addDebugInfo])

  // Desconectar
  const disconnect = useCallback(() => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect()
    }
    setIsConnected(false)
    setDeviceName(null)
    deviceRef.current = null
    characteristicRef.current = null
    addDebugInfo('🔌 Disconectado manualmente')
  }, [addDebugInfo])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isConnected,
    isPrinting,
    error,
    deviceName,
    debugInfo,
    connect,
    disconnect,
    print,
    clearError,
    isSupported: isSupported()
  }
}




