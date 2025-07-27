'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { XCircle } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    // Crear instancia del escáner
    const html5QrCode = new Html5Qrcode('reader')
    scannerRef.current = html5QrCode

    // Solicitar permisos de cámara
    const requestCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        setPermissionGranted(true)
        setError(null)
      } catch (err) {
        setError('No se pudo acceder a la cámara. Por favor, concede permisos.')
        setPermissionGranted(false)
      }
    }

    requestCameraPermission()

    // Limpiar al desmontar
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error('Error al detener el escáner:', err))
      }
    }
  }, [])

  useEffect(() => {
    // Iniciar escáner cuando se conceden permisos
    if (permissionGranted && scannerRef.current) {
      const qrCodeSuccessCallback = (decodedText: string) => {
        onScan(decodedText)
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      }

      scannerRef.current.start(
        { facingMode: 'environment' }, // Usar cámara trasera
        config,
        qrCodeSuccessCallback,
        undefined
      ).catch(err => {
        setError(`Error al iniciar el escáner: ${err}`)
      })
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error('Error al detener el escáner:', err))
      }
    }
  }, [permissionGranted, onScan])

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
              {error}
            </div>
          ) : null}

          <div id="reader" className="w-full h-64 overflow-hidden rounded-lg"></div>

          <div className="mt-4 text-center text-sm text-neutral-600">
            <p>Coloca el código de barras frente a la cámara para escanear</p>
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="w-full py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg text-neutral-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}