'use client'

import { useState, useEffect, useRef } from 'react'
import { log } from '@/lib/secureLogger'
import { Bluetooth, Usb, Wifi, Search, X, Settings, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const ScannerConfig = dynamic(() => import('./ScannerConfig'), {
  ssr: false
})

// Tipos extendidos para APIs experimentales
interface ExtendedNavigator extends Navigator {
  bluetooth?: {
    requestDevice(options: any): Promise<BluetoothDevice>
    getDevices?(): Promise<BluetoothDevice[]>
  }
  hid?: {
    requestDevice(options: any): Promise<any[]>
    getDevices(): Promise<any[]>
  }
}

interface ExtendedBluetoothCharacteristic extends BluetoothRemoteGATTCharacteristic {
  startNotifications?(): Promise<BluetoothRemoteGATTCharacteristic>
  stopNotifications?(): Promise<BluetoothRemoteGATTCharacteristic>
  addEventListener?(type: string, listener: (event: any) => void): void
  removeEventListener?(type: string, listener: (event: any) => void): void
  value?: DataView
}

interface ExternalScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  isOpen: boolean
}

interface ScannerDevice {
  id: string
  name: string
  type: 'bluetooth' | 'usb' | 'hid'
  connected: boolean
  batteryLevel?: number
}

export default function ExternalScanner({ onScan, onClose, isOpen }: ExternalScannerProps) {
  const [devices, setDevices] = useState<ScannerDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<ScannerDevice | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [scanBuffer, setScanBuffer] = useState('')
  const [lastScanTime, setLastScanTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bluetoothDeviceRef = useRef<BluetoothDevice | null>(null)
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)

  // Configuración de escáneres conocidos
  const KNOWN_SCANNERS = [
    { name: 'Bluetooth Scanner', serviceUUID: '0000180f-0000-1000-8000-00805f9b34fb' },
    { name: 'HID Scanner', serviceUUID: '00001812-0000-1000-8000-00805f9b34fb' },
    { name: 'Generic Scanner', serviceUUID: '0000ffe0-0000-1000-8000-00805f9b34fb' }
  ]

  // Detectar dispositivos disponibles
  const detectDevices = async () => {
    log.error('🔍 Detectando escáneres disponibles...')
    const detectedDevices: ScannerDevice[] = []
    const extNavigator = navigator as ExtendedNavigator

    try {
      // Detectar dispositivos Bluetooth
      if (extNavigator.bluetooth) {
        log.error('📱 Bluetooth disponible, buscando dispositivos...')
        
        // Verificar dispositivos ya emparejados
        try {
          if (extNavigator.bluetooth.getDevices) {
            const devices = await extNavigator.bluetooth.getDevices()
            devices.forEach(device => {
              if (device.name && (device.name.toLowerCase().includes('scanner') || 
                                 device.name.toLowerCase().includes('barcode') ||
                                 device.name.toLowerCase().includes('qr'))) {
                detectedDevices.push({
                  id: device.id,
                  name: device.name,
                  type: 'bluetooth',
                  connected: device.gatt?.connected || false
                })
              }
            })
          }
        } catch (err) {
          log.error('⚠️ Error al obtener dispositivos Bluetooth emparejados:', err)
        }
      }

      // Detectar dispositivos USB/HID
      if (extNavigator.hid) {
        log.error('🔌 HID disponible, buscando dispositivos USB...')
        try {
          const hidDevices = await extNavigator.hid.getDevices()
          hidDevices.forEach((device: any) => {
            if (device.productName && (device.productName.toLowerCase().includes('scanner') ||
                                     device.productName.toLowerCase().includes('barcode') ||
                                     device.productName.toLowerCase().includes('qr'))) {
              detectedDevices.push({
                id: device.vendorId + '_' + device.productId,
                name: device.productName,
                type: 'hid',
                connected: device.opened || false
              })
            }
          })
        } catch (err) {
          log.error('⚠️ Error al obtener dispositivos HID:', err)
        }
      }

      setDevices(detectedDevices)
      log.error(`✅ Detectados ${detectedDevices.length} escáneres`)
      
    } catch (error) {
      log.error('❌ Error al detectar dispositivos:', error)
      setError('Error al detectar dispositivos de escaneo')
    }
  }

  // Solicitar nuevo dispositivo Bluetooth (BLE)
  const requestBluetoothDevice = async () => {
    const extNavigator = navigator as ExtendedNavigator
    if (!extNavigator.bluetooth) {
      setError('Bluetooth no está disponible en este dispositivo')
      return
    }

    try {
      log.error('🔍 Solicitando nuevo dispositivo Bluetooth...')
      
      // Solicitar dispositivo con filtros amplios para escáneres
      const device = await extNavigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Scanner' },
          { namePrefix: 'Barcode' },
          { namePrefix: 'QR' },
          { namePrefix: 'Code' },
          { namePrefix: 'Scan' },
          { namePrefix: 'BT' },
          { namePrefix: 'Bluetooth' }
        ],
        optionalServices: [
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
          '00001812-0000-1000-8000-00805f9b34fb', // HID Service
          '0000ffe0-0000-1000-8000-00805f9b34fb', // Generic Scanner Service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // HM-10 Service
        ]
      })

      if (device) {
        const newDevice: ScannerDevice = {
          id: device.id || 'bluetooth-' + Date.now(),
          name: device.name || 'Escáner Bluetooth',
          type: 'bluetooth',
          connected: device.gatt?.connected || false
        }
        
        setDevices(prev => [...prev, newDevice])
        toast.success(`Dispositivo encontrado: ${newDevice.name}`)
        log.error('✅ Nuevo dispositivo Bluetooth agregado:', newDevice.name)
      }
    } catch (error) {
      log.error('❌ Error al solicitar dispositivo Bluetooth:', error)
      if (error instanceof Error) {
        if (error.message.includes('User cancelled')) {
          toast.error('Selección de dispositivo cancelada')
        } else if (error.message.includes('Bluetooth adapter not available')) {
          setError('Bluetooth no está habilitado en este dispositivo')
        } else {
          setError(`Error al buscar dispositivo: ${error.message}`)
        }
      }
    }
  }

  // Solicitar nuevo dispositivo HID
  const requestHIDDevice = async () => {
    const extNavigator = navigator as ExtendedNavigator
    if (!extNavigator.hid) {
      setError('HID no está disponible en este dispositivo')
      return
    }

    try {
      log.error('🔍 Solicitando nuevo dispositivo HID...')
      
      // Solicitar dispositivo HID
      const devices = await extNavigator.hid.requestDevice({
        filters: [
          { usagePage: 0x0C }, // Consumer devices
          { usagePage: 0x01 }, // Generic desktop
          { usagePage: 0x07 }  // Keyboard/Keypad
        ]
      })

      devices.forEach((device: any) => {
        const newDevice: ScannerDevice = {
          id: `hid-${device.vendorId}-${device.productId}`,
          name: device.productName || `Escáner HID (${device.vendorId}:${device.productId})`,
          type: 'hid',
          connected: device.opened || false
        }
        
        setDevices(prev => {
          // Evitar duplicados
          if (prev.find(d => d.id === newDevice.id)) {
            return prev
          }
          return [...prev, newDevice]
        })
        
        toast.success(`Dispositivo HID encontrado: ${newDevice.name}`)
        log.error('✅ Nuevo dispositivo HID agregado:', newDevice.name)
      })
    } catch (error) {
      log.error('❌ Error al solicitar dispositivo HID:', error)
      if (error instanceof Error) {
        if (error.message.includes('User cancelled')) {
          toast.error('Selección de dispositivo cancelada')
        } else {
          setError(`Error al buscar dispositivo HID: ${error.message}`)
        }
      }
    }
  }

  // Conectar a dispositivo Bluetooth
  const connectBluetooth = async (device: ScannerDevice) => {
    const extNavigator = navigator as ExtendedNavigator
    if (!extNavigator.bluetooth) {
      setError('Bluetooth no está disponible en este dispositivo')
      return false
    }

    try {
      setConnectionStatus('connecting')
      log.error('🔗 Conectando a dispositivo Bluetooth:', device.name)

      // Solicitar dispositivo Bluetooth
      const bluetoothDevice = await extNavigator.bluetooth.requestDevice({
        filters: [{ name: device.name }],
        optionalServices: KNOWN_SCANNERS.map(s => s.serviceUUID)
      })

      bluetoothDeviceRef.current = bluetoothDevice

      // Conectar al servidor GATT
      const server = await bluetoothDevice.gatt?.connect()
      if (!server) throw new Error('No se pudo conectar al servidor GATT')

      // Buscar servicio de escaneo
      let service = null
      for (const scanner of KNOWN_SCANNERS) {
        try {
          service = await server.getPrimaryService(scanner.serviceUUID)
          break
        } catch (err) {
          continue
        }
      }

      if (!service) {
        throw new Error('No se encontró servicio de escaneo compatible')
      }

      // Obtener característica de datos
      const characteristics = await service.getCharacteristics()
      const dataCharacteristic = characteristics.find(c => c.properties.notify)
      
      if (!dataCharacteristic) {
        throw new Error('No se encontró característica de notificación')
      }

      characteristicRef.current = dataCharacteristic

      // Configurar notificaciones
      const extCharacteristic = dataCharacteristic as ExtendedBluetoothCharacteristic
      if (extCharacteristic.startNotifications) {
        await extCharacteristic.startNotifications()
      }
      if (extCharacteristic.addEventListener) {
        extCharacteristic.addEventListener('characteristicvaluechanged', handleBluetoothData)
      }

      setConnectionStatus('connected')
      setSelectedDevice({ ...device, connected: true })
      toast.success(`Conectado a ${device.name}`)
      log.error('✅ Dispositivo Bluetooth conectado exitosamente')
      return true

    } catch (error) {
      log.error('❌ Error al conectar Bluetooth:', error)
      setError(`Error al conectar: ${error}`)
      setConnectionStatus('disconnected')
      return false
    }
  }

  // Manejar datos del Bluetooth
  const handleBluetoothData = (event: any) => {
    const target = event.target as ExtendedBluetoothCharacteristic
    const value = target.value
    if (!value) return

    // Convertir datos a string
    const decoder = new TextDecoder('utf-8')
    const data = decoder.decode(value)
    
    log.error('📡 Datos recibidos del Bluetooth:', data)
    processScanData(data)
  }

  // Conectar a dispositivo USB/HID
  const connectUSB = async (device: ScannerDevice) => {
    const extNavigator = navigator as ExtendedNavigator
    if (!extNavigator.hid) {
      setError('HID no está disponible en este dispositivo')
      return false
    }

    try {
      setConnectionStatus('connecting')
      log.error('🔌 Conectando a dispositivo USB:', device.name)

      // Solicitar acceso al dispositivo HID
      const hidDevices = await extNavigator.hid.requestDevice({
        filters: [{ productName: device.name }]
      })

      if (hidDevices.length === 0) {
        throw new Error('No se seleccionó ningún dispositivo')
      }

      const hidDevice = hidDevices[0]
      await hidDevice.open()

      // Configurar listener para datos
      hidDevice.addEventListener('inputreport', (event: any) => {
        const { data } = event
        const decoder = new TextDecoder('utf-8')
        const scanData = decoder.decode(data)
        log.error('📡 Datos recibidos del USB:', scanData)
        processScanData(scanData)
      })

      setConnectionStatus('connected')
      setSelectedDevice({ ...device, connected: true })
      toast.success(`Conectado a ${device.name}`)
      log.error('✅ Dispositivo USB conectado exitosamente')
      return true

    } catch (error) {
      log.error('❌ Error al conectar USB:', error)
      setError(`Error al conectar: ${error}`)
      setConnectionStatus('disconnected')
      return false
    }
  }

  // Procesar datos escaneados
  const processScanData = (data: string) => {
    const now = Date.now()
    
    // Evitar duplicados rápidos
    if (now - lastScanTime < 1000) {
      return
    }

    // Limpiar y validar datos
    const cleanData = data
      .trim()
      .replace(/[\r\n\t]/g, '')
      .replace(/\s+/g, '')
      .replace(/[^\w\d]/g, '')

    if (cleanData.length >= 3) {
      log.error('✅ Código escaneado válido:', cleanData)
      setLastScanTime(now)
      onScan(cleanData)
      toast.success('Código escaneado correctamente')
    } else {
      log.error('⚠️ Código inválido:', cleanData)
      toast.error('Código de barras inválido')
    }
  }

  // Desconectar dispositivo
  const disconnect = async () => {
    try {
      if (bluetoothDeviceRef.current?.gatt?.connected) {
        await bluetoothDeviceRef.current.gatt.disconnect()
      }
      
      if (characteristicRef.current) {
        const extCharacteristic = characteristicRef.current as ExtendedBluetoothCharacteristic
        if (extCharacteristic.stopNotifications) {
          await extCharacteristic.stopNotifications()
        }
        if (extCharacteristic.removeEventListener) {
          extCharacteristic.removeEventListener('characteristicvaluechanged', handleBluetoothData)
        }
      }

      bluetoothDeviceRef.current = null
      characteristicRef.current = null
      setConnectionStatus('disconnected')
      setSelectedDevice(null)
      toast.success('Dispositivo desconectado')
      
    } catch (error) {
      log.error('Error al desconectar:', error)
    }
  }

  // Manejar entrada de teclado (para escáneres que actúan como teclado)
  const handleKeyboardInput = (e: KeyboardEvent) => {
    if (!isOpen || connectionStatus !== 'connected') return

    // Detectar entrada rápida de caracteres (típico de escáneres)
    if (e.key.length === 1) {
      setScanBuffer(prev => prev + e.key)
      
      // Limpiar buffer después de un tiempo
      setTimeout(() => {
        setScanBuffer(prev => {
          if (prev.length > 0) {
            processScanData(prev)
            return ''
          }
          return prev
        })
      }, 100)
    } else if (e.key === 'Enter' && scanBuffer.length > 0) {
      processScanData(scanBuffer)
      setScanBuffer('')
    }
  }

  // Efectos
  useEffect(() => {
    if (isOpen) {
      detectDevices()
      document.addEventListener('keydown', handleKeyboardInput)
      
      // Enfocar input para capturar entrada de teclado
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyboardInput)
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="p-4 bg-primary-600 text-white flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            Escáner Externo
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(true)}
              className="text-white hover:text-blue-200"
              title="Configurar escáner"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="text-white hover:text-red-200">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Estado de conexión */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : connectionStatus === 'connecting' ? (
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              ) : (
                <AlertCircle className="h-5 w-5 text-neutral-400" />
              )}
              <span className="text-sm font-medium">
                {connectionStatus === 'connected' ? 'Conectado' :
                 connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
              </span>
            </div>
            {selectedDevice && (
              <span className="text-xs text-neutral-600">{selectedDevice.name}</span>
            )}
          </div>

          {/* Lista de dispositivos */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-neutral-700">Dispositivos Disponibles</h4>
              <button
                onClick={detectDevices}
                className="p-1 text-neutral-500 hover:text-neutral-700"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            
            {/* Botones para solicitar dispositivos manualmente */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={requestBluetoothDevice}
                disabled={connectionStatus === 'connecting'}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bluetooth className="h-3 w-3" />
                Buscar BLE
              </button>
              <button
                onClick={requestHIDDevice}
                disabled={connectionStatus === 'connecting'}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Usb className="h-3 w-3" />
                Buscar HID
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {devices.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No se encontraron escáneres.
                  <br />
                  Asegúrate de que el dispositivo esté encendido y emparejado.
                </p>
              ) : (
                devices.map(device => (
                  <div
                    key={device.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDevice?.id === device.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => {
                      if (connectionStatus === 'disconnected') {
                        if (device.type === 'bluetooth') {
                          connectBluetooth(device)
                        } else {
                          connectUSB(device)
                        }
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.type === 'bluetooth' ? (
                          <Bluetooth className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Usb className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium">{device.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {device.connected && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-xs text-neutral-500 capitalize">
                          {device.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Input oculto para capturar entrada de teclado */}
          <input
            ref={inputRef}
            type="text"
            className="sr-only"
            value={scanBuffer}
            onChange={() => {}} // Manejado por keydown
          />

          {/* Instrucciones */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800 mb-1">Instrucciones:</h5>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Si no ves tu escáner:</strong> Usa los botones "Buscar BLE" o "Buscar HID"</li>
              <li>• <strong>BLE:</strong> Para escáneres Bluetooth Low Energy modernos</li>
              <li>• <strong>HID:</strong> Para escáneres USB o que actúan como teclado</li>
              <li>• Selecciona un dispositivo de la lista para conectar</li>
              <li>• Una vez conectado, escanea cualquier código de barras</li>
              <li>• El código se enviará automáticamente al sistema</li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex gap-2">
          {connectionStatus === 'connected' ? (
            <button
              onClick={disconnect}
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Desconectar
            </button>
          ) : (
            <button
              onClick={detectDevices}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Buscar Dispositivos
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg text-neutral-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Scanner Configuration Modal */}
      <ScannerConfig
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onDeviceSelect={(device) => {
          setSelectedDevice(device)
          setConnectionStatus(device.connected ? 'connected' : 'disconnected')
          setShowConfig(false)
          toast.success(`Escáner configurado: ${device.name}`)
        }}
      />
    </div>
  )
}