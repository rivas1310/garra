/**
 * Hook personalizado para impresión TSPL via Bluetooth
 * Integra el generador TSPL con el sistema de impresión Bluetooth existente
 */

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { 
  generateProductLabelTSPL, 
  generateMultipleProductLabelsTSPL,
  generateTestLabelTSPL,
  generateTestLabelArribaTSPL,
  generateTestLabelAbajoTSPL,
  generateTestLabelIzquierdaTSPL,
  generateTestLabelDerechaTSPL,
  generateTestLabelCentroTSPL,
  TSPLLabelData,
  validateTSPLCommands,
  getTSPLDebugInfo
} from '@/lib/tsplGenerator'

export interface TSPLPrinterState {
  isConnected: boolean
  isConnecting: boolean
  isPrinting: boolean
  device: BluetoothDevice | null
  characteristic: BluetoothRemoteGATTCharacteristic | null
  error: string | null
  debugInfo: any
}

export interface TSPLPrintOptions {
  labelSize: string
  copies: number
  validateCommands: boolean
  showDebugInfo: boolean
}

const DEFAULT_PRINT_OPTIONS: TSPLPrintOptions = {
  labelSize: '51x25',
  copies: 1,
  validateCommands: true,
  showDebugInfo: false
}

/**
 * Hook para manejar impresión TSPL via Bluetooth
 */
export function useTSPLPrinter() {
  const [state, setState] = useState<TSPLPrinterState>({
    isConnected: false,
    isConnecting: false,
    isPrinting: false,
    device: null,
    characteristic: null,
    error: null,
    debugInfo: null
  })

  /**
   * Actualiza el estado del printer
   */
  const updateState = useCallback((updates: Partial<TSPLPrinterState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Verifica si Web Bluetooth está disponible
   */
  const isBluetoothAvailable = useCallback((): boolean => {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      updateState({ error: 'Web Bluetooth no está soportado en este navegador' })
      toast.error('Web Bluetooth no está soportado')
      return false
    }
    return true
  }, [updateState])

  /**
   * Conecta con una impresora Bluetooth
   */
  const connect = useCallback(async (): Promise<boolean> => {
    if (!isBluetoothAvailable()) return false

    updateState({ isConnecting: true, error: null })

    try {
      // Verificar que navigator.bluetooth existe
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth no está disponible en este navegador');
      }
      
      // Solicitar dispositivo Bluetooth
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Servicio de impresora
          { namePrefix: 'TSC' },
          { namePrefix: 'GODEX' },
          { namePrefix: 'ZEBRA' },
          { namePrefix: 'PT-' }
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
          '0000ff00-0000-1000-8000-00805f9b34fb'
        ]
      })

      // Conectar al dispositivo
      const server = await device.gatt!.connect()
      
      // Buscar servicio de impresión
      let service: BluetoothRemoteGATTService
      let characteristic: BluetoothRemoteGATTCharacteristic

      try {
        // Intentar servicio principal
        service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
        characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')
      } catch {
        try {
          // Servicio alternativo
          service = await server.getPrimaryService('49535343-fe7d-4ae5-8fa9-9fafd205e455')
          characteristic = await service.getCharacteristic('49535343-8841-43f4-a8d4-ecbe34729bb3')
        } catch {
          // Servicio genérico
          service = await server.getPrimaryService('0000ff00-0000-1000-8000-00805f9b34fb')
          characteristic = await service.getCharacteristic('0000ff02-0000-1000-8000-00805f9b34fb')
        }
      }

      updateState({
        isConnected: true,
        isConnecting: false,
        device,
        characteristic,
        error: null
      })

      toast.success(`Conectado a ${device.name || 'Impresora TSPL'}`)
      return true

    } catch (error: any) {
      const errorMessage = error.message || 'Error al conectar con la impresora'
      updateState({
        isConnecting: false,
        error: errorMessage
      })
      toast.error(errorMessage)
      return false
    }
  }, [isBluetoothAvailable, updateState])

  /**
   * Desconecta de la impresora
   */
  const disconnect = useCallback(async (): Promise<void> => {
    if (state.device?.gatt?.connected) {
      await state.device.gatt.disconnect()
    }

    updateState({
      isConnected: false,
      device: null,
      characteristic: null,
      error: null
    })

    toast.success('Desconectado de la impresora')
  }, [state.device, updateState])

  /**
   * Envía comandos TSPL a la impresora
   */
  const sendTSPLCommands = useCallback(async (
    commands: string,
    options: Partial<TSPLPrintOptions> = {}
  ): Promise<boolean> => {
    const opts = { ...DEFAULT_PRINT_OPTIONS, ...options }

    if (!state.isConnected || !state.characteristic) {
      toast.error('No hay conexión con la impresora')
      return false
    }

    // Validar comandos si está habilitado
    if (opts.validateCommands && !validateTSPLCommands(commands)) {
      toast.error('Los comandos TSPL no son válidos')
      return false
    }

    updateState({ isPrinting: true, error: null })

    try {
      // Mostrar información de debug si está habilitada
      if (opts.showDebugInfo) {
        const debugInfo = getTSPLDebugInfo(commands)
        updateState({ debugInfo })
        console.log('TSPL Debug Info:', debugInfo)
        console.log('TSPL Commands:', commands)
      }

      // Convertir comandos a buffer
      const buffer = new TextEncoder().encode(commands)
      
      // Enviar en chunks si es muy grande
      const chunkSize = 20 // Tamaño de chunk para Bluetooth
      
      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, i + chunkSize)
        await state.characteristic.writeValue(chunk)
        
        // Pequeña pausa entre chunks
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      updateState({ isPrinting: false })
      toast.success(`Etiqueta${opts.copies > 1 ? 's' : ''} enviada${opts.copies > 1 ? 's' : ''} a la impresora`)
      return true

    } catch (error: any) {
      const errorMessage = error.message || 'Error al imprimir'
      updateState({
        isPrinting: false,
        error: errorMessage
      })
      toast.error(errorMessage)
      return false
    }
  }, [state.isConnected, state.characteristic, updateState])

  /**
   * Imprime una etiqueta de producto
   */
  const printProductLabel = useCallback(async (
    labelData: TSPLLabelData,
    options: Partial<TSPLPrintOptions> = {}
  ): Promise<boolean> => {
    const opts = { ...DEFAULT_PRINT_OPTIONS, ...options }
    
    try {
      const commands = generateProductLabelTSPL(
        labelData,
        opts.labelSize,
        opts.copies
      )
      
      return await sendTSPLCommands(commands, opts)
    } catch (error: any) {
      toast.error('Error al generar comandos TSPL: ' + error.message)
      return false
    }
  }, [sendTSPLCommands])

  /**
   * Imprime múltiples etiquetas de productos
   */
  const printMultipleProductLabels = useCallback(async (
    labels: TSPLLabelData[],
    options: Partial<TSPLPrintOptions> = {}
  ): Promise<boolean> => {
    const opts = { ...DEFAULT_PRINT_OPTIONS, ...options }
    
    if (labels.length === 0) {
      toast.error('No hay etiquetas para imprimir')
      return false
    }

    try {
      const commands = generateMultipleProductLabelsTSPL(
        labels,
        opts.labelSize
      )
      
      return await sendTSPLCommands(commands, opts)
    } catch (error: any) {
      toast.error('Error al generar comandos TSPL: ' + error.message)
      return false
    }
  }, [sendTSPLCommands])

  /**
   * Imprime etiqueta de prueba con nuevas configuraciones
   */
  const printTestLabel = useCallback(async (
    labelSize: string = '51x25'
  ): Promise<boolean> => {
    if (!state.isConnected || !state.characteristic) {
      updateState({ error: 'No hay conexión con la impresora' })
      toast.error('No hay conexión con la impresora')
      return false
    }

    updateState({ isPrinting: true, error: null })

    try {
      // Generar comandos TSPL para etiqueta de prueba
      const tsplCommands = generateTestLabelTSPL(labelSize, 1)
      
      // Validar comandos si está habilitado
      if (!validateTSPLCommands(tsplCommands)) {
        throw new Error('Los comandos TSPL generados no son válidos')
      }

      // Obtener información de debug
      const debugInfo = getTSPLDebugInfo(tsplCommands)
      updateState({ debugInfo })

      // Enviar comandos a la impresora
      const success = await sendTSPLCommands(tsplCommands)
      
      if (success) {
        toast.success('Etiqueta de prueba enviada correctamente')
        return true
      } else {
        throw new Error('Error al enviar comandos a la impresora')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      updateState({ error: errorMessage })
      toast.error(`Error al imprimir etiqueta de prueba: ${errorMessage}`)
      return false
    } finally {
      updateState({ isPrinting: false })
    }
  }, [state.isConnected, state.characteristic, updateState, sendTSPLCommands])

  /**
   * Funciones de prueba para entender movimiento de coordenadas
   */
  const printTestArriba = useCallback(async (labelSize: string = '51x25'): Promise<boolean> => {
    if (!state.isConnected || !state.characteristic) {
      toast.error('No hay conexión con la impresora')
      return false
    }
    updateState({ isPrinting: true, error: null })
    try {
      const tsplCommands = generateTestLabelArribaTSPL(labelSize, 1)
      const success = await sendTSPLCommands(tsplCommands)
      if (success) {
        toast.success('Etiqueta ARRIBA enviada')
        return true
      } else {
        throw new Error('Error al enviar comandos')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      updateState({ error: errorMessage })
      toast.error(`Error: ${errorMessage}`)
      return false
    } finally {
      updateState({ isPrinting: false })
    }
  }, [state.isConnected, state.characteristic, updateState, sendTSPLCommands])

  const printTestAbajo = useCallback(async (labelSize: string = '51x25'): Promise<boolean> => {
    if (!state.isConnected || !state.characteristic) {
      toast.error('No hay conexión con la impresora')
      return false
    }
    updateState({ isPrinting: true, error: null })
    try {
      const tsplCommands = generateTestLabelAbajoTSPL(labelSize, 1)
      const success = await sendTSPLCommands(tsplCommands)
      if (success) {
        toast.success('Etiqueta ABAJO enviada')
        return true
      } else {
        throw new Error('Error al enviar comandos')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      updateState({ error: errorMessage })
      toast.error(`Error: ${errorMessage}`)
      return false
    } finally {
      updateState({ isPrinting: false })
    }
  }, [state.isConnected, state.characteristic, updateState, sendTSPLCommands])

  const printTestIzquierda = useCallback(async (labelSize: string = '51x25'): Promise<boolean> => {
    if (!state.isConnected || !state.characteristic) {
      toast.error('No hay conexión con la impresora')
      return false
    }
    updateState({ isPrinting: true, error: null })
    try {
      const tsplCommands = generateTestLabelIzquierdaTSPL(labelSize, 1)
      const success = await sendTSPLCommands(tsplCommands)
      if (success) {
        toast.success('Etiqueta IZQUIERDA enviada')
        return true
      } else {
        throw new Error('Error al enviar comandos')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      updateState({ error: errorMessage })
      toast.error(`Error: ${errorMessage}`)
      return false
    } finally {
      updateState({ isPrinting: false })
    }
  }, [state.isConnected, state.characteristic, updateState, sendTSPLCommands])

  const printTestDerecha = useCallback(async (labelSize: string = '51x25'): Promise<boolean> => {
    if (!state.isConnected || !state.characteristic) {
      toast.error('No hay conexión con la impresora')
      return false
    }
    updateState({ isPrinting: true, error: null })
    try {
      const tsplCommands = generateTestLabelDerechaTSPL(labelSize, 1)
      const success = await sendTSPLCommands(tsplCommands)
      if (success) {
        toast.success('Etiqueta DERECHA enviada')
        return true
      } else {
        throw new Error('Error al enviar comandos')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      updateState({ error: errorMessage })
      toast.error(`Error: ${errorMessage}`)
      return false
    } finally {
      updateState({ isPrinting: false })
    }
  }, [state.isConnected, state.characteristic, updateState, sendTSPLCommands])

  const printTestCentro = useCallback(async (labelSize: string = '51x25'): Promise<boolean> => {
    if (!state.isConnected || !state.characteristic) {
      toast.error('No hay conexión con la impresora')
      return false
    }
    updateState({ isPrinting: true, error: null })
    try {
      const tsplCommands = generateTestLabelCentroTSPL(labelSize, 1)
      const success = await sendTSPLCommands(tsplCommands)
      if (success) {
        toast.success('Etiqueta CENTRO enviada')
        return true
      } else {
        throw new Error('Error al enviar comandos')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      updateState({ error: errorMessage })
      toast.error(`Error: ${errorMessage}`)
      return false
    } finally {
      updateState({ isPrinting: false })
    }
  }, [state.isConnected, state.characteristic, updateState, sendTSPLCommands])

  /**
   * Limpia el estado de error
   */
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  /**
   * Obtiene el estado de conexión
   */
  const getConnectionStatus = useCallback(() => {
    return {
      isAvailable: !!navigator.bluetooth,
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      deviceName: state.device?.name || null
    }
  }, [state.isConnected, state.isConnecting, state.device])

  return {
    // Estado
    ...state,
    
    // Funciones de conexión
    connectToPrinter: connect,
    disconnectFromPrinter: disconnect,
    isBluetoothAvailable,
    getConnectionStatus,
    
    // Funciones de impresión
    printProductLabel,
    printMultipleProductLabels,
    printTestLabel,
    printTestArriba,
    printTestAbajo,
    printTestIzquierda,
    printTestDerecha,
    printTestCentro,
    sendTSPLCommands,
    validateTSPLCommands,
    
    // Utilidades
    clearError
  }
}

/**
 * Hook simplificado para uso básico
 */
export function useSimpleTSPLPrinter() {
  const {
    isConnected,
    isConnecting,
    isPrinting,
    error,
    connectToPrinter,
    disconnectFromPrinter,
    printProductLabel,
    clearError
  } = useTSPLPrinter()

  return {
    isConnected,
    isConnecting,
    isPrinting,
    error,
    connect: connectToPrinter,
    disconnect: disconnectFromPrinter,
    printLabel: printProductLabel,
    clearError
  }
}

export default useTSPLPrinter