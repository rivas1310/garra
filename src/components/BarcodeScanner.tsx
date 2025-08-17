'use client'

import { useEffect, useRef, useState } from 'react'
import { log } from '@/lib/secureLogger'
import { Html5Qrcode } from 'html5-qrcode'
import { XCircle, Camera, RefreshCw } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')

  // Obtener dispositivos de cámara disponibles
  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      setCameraDevices(cameras)
      
      // Seleccionar cámara trasera por defecto si está disponible
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('trasera') ||
        camera.label.toLowerCase().includes('environment')
      )
      
      if (backCamera) {
        setSelectedCamera(backCamera.deviceId)
      } else if (cameras.length > 0) {
        setSelectedCamera(cameras[0].deviceId)
      }
    } catch (err) {
      log.error('Error al obtener dispositivos de cámara:', err)
    }
  }

  // Solicitar permisos de cámara
  const requestCameraPermission = async () => {
    try {
      setError(null)
      await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      setPermissionGranted(true)
      await getCameraDevices()
    } catch (err: any) {
      log.error('Error al solicitar permisos de cámara:', err)
      
      if (err.name === 'NotAllowedError') {
        setError('Permisos de cámara denegados. Por favor, permite el acceso a la cámara en tu navegador.')
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara en tu dispositivo.')
      } else if (err.name === 'NotReadableError') {
        setError('La cámara está siendo utilizada por otra aplicación. Cierra otras apps que usen la cámara e intenta de nuevo.')
      } else if (err.name === 'OverconstrainedError') {
        setError('La cámara no soporta la configuración solicitada. Intentando con configuración básica...')
        // Intentar con configuración más básica
        try {
          await navigator.mediaDevices.getUserMedia({ video: true })
          setPermissionGranted(true)
          await getCameraDevices()
        } catch (basicErr) {
          setError('No se pudo acceder a la cámara con ninguna configuración.')
        }
      } else {
        setError(`Error al acceder a la cámara: ${err.message || 'Error desconocido'}`)
      }
      setPermissionGranted(false)
    }
  }

  // Iniciar escáner
  const startScanner = async () => {
    if (!scannerRef.current || !permissionGranted) return

    try {
      setIsScanning(true)
      setError(null)

      const qrCodeSuccessCallback = (decodedText: string) => {
        // Limpiar el código escaneado
        const cleanCode = decodedText
          .trim()
          .replace(/[\r\n\t]/g, '') // Remover saltos de línea, retornos de carro y tabulaciones
          .replace(/\s+/g, '') // Remover espacios múltiples
          .replace(/[^\w\d]/g, '') // Solo mantener letras y números

        log.error('📱 Código escaneado:', {
          original: decodedText,
          cleaned: cleanCode,
          originalLength: decodedText.length,
          cleanedLength: cleanCode.length,
          hasSpecialChars: /[\r\n\t\s]/.test(decodedText),
          originalBytes: Array.from(decodedText).map(c => c.charCodeAt(0)),
          cleanedBytes: Array.from(cleanCode).map(c => c.charCodeAt(0))
        })

        if (cleanCode.length >= 3) {
          log.error('✅ Enviando código limpio al callback:', cleanCode)
          onScan(cleanCode)
        } else {
          log.error('⚠️ Código demasiado corto después de limpiar:', cleanCode)
          setError('Código de barras inválido. Intenta escanear de nuevo.')
        }
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
        disableFlip: false
      }

      // Intentar con cámara específica si está seleccionada
      const constraints = selectedCamera 
        ? { deviceId: { exact: selectedCamera } }
        : { facingMode: 'environment' }

      await scannerRef.current.start(
        constraints,
        config,
        qrCodeSuccessCallback,
        undefined
      )
    } catch (err: any) {
      log.error('Error al iniciar el escáner:', err)
      setError(`Error al iniciar el escáner: ${err.message || 'Error desconocido'}`)
      setIsScanning(false)
    }
  }

  // Detener escáner
  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch (err) {
        log.error('Error al detener el escáner:', err)
      }
    }
  }

  // Reiniciar escáner
  const restartScanner = async () => {
    await stopScanner()
    await requestCameraPermission()
    if (permissionGranted) {
      await startScanner()
    }
  }

  useEffect(() => {
    // Crear instancia del escáner
    const html5QrCode = new Html5Qrcode('reader')
    scannerRef.current = html5QrCode

    // Solicitar permisos iniciales
    requestCameraPermission()

    // Limpiar al desmontar
    return () => {
      stopScanner()
    }
  }, [])

  useEffect(() => {
    // Iniciar escáner cuando se conceden permisos
    if (permissionGranted && !isScanning) {
      startScanner()
    }
  }, [permissionGranted, selectedCamera])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 bg-primary-600 text-white flex justify-between items-center">
          <h3 className="text-lg font-medium">Escanear Código</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-start">
                <Camera className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error de Cámara</p>
                  <p className="text-sm mt-1">{error}</p>
                  <button
                    onClick={restartScanner}
                    className="mt-2 inline-flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {cameraDevices.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Seleccionar Cámara:
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {cameraDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Cámara ${device.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div id="reader" className="w-full h-64 overflow-hidden rounded-lg border-2 border-neutral-200"></div>

          <div className="mt-4 text-center text-sm text-neutral-600">
            <p>Coloca el código de barras frente a la cámara para escanear</p>
            {isScanning && (
              <p className="text-green-600 mt-1">Escáner activo</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex gap-2">
          <button
            onClick={restartScanner}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reiniciar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg text-neutral-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}