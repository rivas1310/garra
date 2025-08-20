'use client'

import { useState, useEffect } from 'react'
import { Bluetooth, Usb, Settings, Check, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// Tipos extendidos para APIs experimentales
interface USBDevice {
  vendorId: number
  productId: number
  productName?: string
  opened: boolean
}

interface ExtendedNavigator extends Navigator {
  bluetooth?: {
    requestDevice(options: any): Promise<BluetoothDevice>
    getDevices?(): Promise<BluetoothDevice[]>
  }
  usb?: {
    requestDevice(options: any): Promise<USBDevice>
    getDevices(): Promise<USBDevice[]>
  }
}

interface ScannerDevice {
  id: string
  name: string
  type: 'bluetooth' | 'usb'
  connected: boolean
  available: boolean
}

interface ScannerConfigProps {
  isOpen: boolean
  onClose: () => void
  onDeviceSelect: (device: ScannerDevice) => void
}

export default function ScannerConfig({ isOpen, onClose, onDeviceSelect }: ScannerConfigProps) {
  const [devices, setDevices] = useState<ScannerDevice[]>([])
  const [scanning, setScanning] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  // Detectar dispositivos Bluetooth disponibles
  const scanBluetoothDevices = async () => {
    const extNavigator = navigator as ExtendedNavigator
    if (!extNavigator.bluetooth) {
      toast.error('Bluetooth no está disponible en este dispositivo')
      return []
    }

    try {
      const device = await extNavigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      })

      return [{
        id: device.id || 'bluetooth-scanner',
        name: device.name || 'Escáner Bluetooth',
        type: 'bluetooth' as const,
        connected: device.gatt?.connected || false,
        available: true
      }]
    } catch (error) {
      console.error('Error al escanear dispositivos Bluetooth:', error)
      return []
    }
  }

  // Detectar dispositivos USB (simulado)
  const scanUSBDevices = async () => {
    const extNavigator = navigator as ExtendedNavigator
    if (!extNavigator.usb) {
      return []
    }

    try {
      const devices = await extNavigator.usb.getDevices()
      return devices.map((device: USBDevice, index: number) => ({
        id: `usb-${device.vendorId}-${device.productId}`,
        name: `Escáner USB ${index + 1}`,
        type: 'usb' as const,
        connected: device.opened,
        available: true
      }))
    } catch (error) {
      console.error('Error al escanear dispositivos USB:', error)
      return []
    }
  }

  // Escanear todos los dispositivos disponibles
  const scanDevices = async () => {
    setScanning(true)
    try {
      const [bluetoothDevices, usbDevices] = await Promise.all([
        scanBluetoothDevices(),
        scanUSBDevices()
      ])

      const allDevices = [...bluetoothDevices, ...usbDevices]
      setDevices(allDevices)

      if (allDevices.length === 0) {
        toast('No se encontraron escáneres disponibles', {
          icon: 'ℹ️',
          duration: 3000
        })
      } else {
        toast.success(`Se encontraron ${allDevices.length} dispositivo(s)`)
      }
    } catch (error) {
      console.error('Error al escanear dispositivos:', error)
      toast.error('Error al buscar dispositivos')
    } finally {
      setScanning(false)
    }
  }

  // Conectar a un dispositivo
  const connectDevice = async (device: ScannerDevice) => {
    try {
      if (device.type === 'bluetooth') {
        // Lógica de conexión Bluetooth
        toast.success(`Conectado a ${device.name}`)
      } else if (device.type === 'usb') {
        // Lógica de conexión USB
        toast.success(`Conectado a ${device.name}`)
      }

      setSelectedDevice(device.id)
      onDeviceSelect(device)
    } catch (error) {
      console.error('Error al conectar dispositivo:', error)
      toast.error(`Error al conectar a ${device.name}`)
    }
  }

  useEffect(() => {
    if (isOpen) {
      scanDevices()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Configuración de Escáner</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Scan Button */}
          <div className="mb-4">
            <button
              onClick={scanDevices}
              disabled={scanning}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Buscando dispositivos...' : 'Buscar Escáneres'}
            </button>
          </div>

          {/* Device List */}
          <div className="space-y-2">
            {devices.length === 0 && !scanning && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay dispositivos detectados</p>
                <p className="text-sm">Presiona "Buscar Escáneres" para detectar dispositivos</p>
              </div>
            )}

            {devices.map((device) => (
              <div
                key={device.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedDevice === device.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => connectDevice(device)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {device.type === 'bluetooth' ? (
                      <Bluetooth className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Usb className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {device.type} • {device.connected ? 'Conectado' : 'Disponible'}
                      </p>
                    </div>
                  </div>
                  {selectedDevice === device.id && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Nota:</strong> Asegúrate de que tu escáner esté encendido y en modo de emparejamiento.
              Los escáneres USB deben estar conectados al dispositivo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}