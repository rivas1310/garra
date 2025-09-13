'use client'

import { WifiOff, RefreshCw, Home, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function OfflinePage() {
  useEffect(() => {
    document.title = 'Sin Conexión - Garras Felinas'
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icono principal */}
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <WifiOff className="h-10 w-10 text-orange-600" />
          </div>
          
          {/* Título y descripción */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🦁 Sin Conexión
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            No hay conexión a internet disponible en este momento. 
            Verifica tu conexión e intenta nuevamente.
          </p>
          
          {/* Información sobre funcionalidad offline */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              💡 ¿Sabías que?
            </h3>
            <p className="text-sm text-blue-700">
              Algunas páginas que ya visitaste pueden estar disponibles sin conexión. 
              Intenta navegar usando los botones de abajo.
            </p>
          </div>
          
          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar Conexión
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Home className="h-4 w-4" />
                Inicio
              </Link>
              
              <Link
                href="/productos"
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Productos
              </Link>
            </div>
          </div>
          
          {/* Consejos para mejorar la conexión */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">
              💡 Consejos para mejorar tu conexión:
            </h4>
            
            <ul className="text-xs text-gray-600 space-y-1 text-left">
              <li>• Verifica que el WiFi esté activado</li>
              <li>• Intenta acercarte al router</li>
              <li>• Reinicia tu conexión móvil</li>
              <li>• Verifica que tengas datos disponibles</li>
            </ul>
          </div>
          
          {/* Estado de la aplicación */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span>Modo sin conexión activo</span>
            </div>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Esta página funciona sin conexión gracias a la tecnología PWA
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente para mostrar el estado de conectividad
function ConnectivityStatus() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          <span className="text-xs font-medium text-gray-700">Sin conexión</span>
        </div>
      </div>
    </div>
  )
}