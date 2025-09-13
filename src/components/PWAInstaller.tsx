'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Registrar Service Worker
    registerServiceWorker()
    
    // Detectar si ya está instalado
    checkIfInstalled()
    
    // Escuchar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Mostrar banner después de un tiempo si no está instalado
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallBanner(true)
        }
      }, 30000) // 30 segundos
    }
    
    // Detectar cuando se instala
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallBanner(false)
      setDeferredPrompt(null)
      console.log('PWA: App installed successfully')
    }
    
    // Detectar cambios de conectividad
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isInstalled])

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        setSwRegistration(registration)
        console.log('PWA: Service Worker registered successfully')
        
        // Detectar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
        
        // Escuchar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            setUpdateAvailable(true)
          }
        })
        
      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error)
      }
    }
  }

  const checkIfInstalled = () => {
    // Detectar si está en modo standalone (instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches
    
    setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome)
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt')
      } else {
        console.log('PWA: User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    } catch (error) {
      console.error('PWA: Error during installation:', error)
    }
  }

  const handleUpdateClick = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const dismissBanner = () => {
    setShowInstallBanner(false)
    // No mostrar de nuevo en esta sesión
    sessionStorage.setItem('pwa-banner-dismissed', 'true')
  }

  // No mostrar si ya fue descartado en esta sesión
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed')
    if (dismissed) {
      setShowInstallBanner(false)
    }
  }, [])

  return (
    <>
      {/* Banner de instalación */}
      {showInstallBanner && deferredPrompt && !isInstalled && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    📱 ¡Instala Garras Felinas en tu dispositivo!
                  </p>
                  <p className="text-xs opacity-90">
                    Acceso rápido, notificaciones y funciona sin conexión
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Instalar
                </button>
                <button
                  onClick={dismissBanner}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner de actualización */}
      {updateAvailable && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Download className="h-5 w-5 mt-0.5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">
                🆕 Nueva versión disponible
              </p>
              <p className="text-xs opacity-90 mb-3">
                Actualiza para obtener las últimas mejoras
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateClick}
                  className="bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => setUpdateAvailable(false)}
                  className="text-white hover:text-gray-200 transition-colors text-xs"
                >
                  Después
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de conectividad */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 bg-orange-600 text-white p-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Sin conexión</span>
          </div>
        </div>
      )}

      {/* Botón flotante de instalación (solo en móvil) */}
      {deferredPrompt && !showInstallBanner && !isInstalled && (
        <div className="fixed bottom-20 right-4 z-40 md:hidden">
          <button
            onClick={handleInstallClick}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Instalar aplicación"
          >
            <Download className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  )
}

// Hook para detectar si la app está instalada
export function useIsInstalled() {
  const [isInstalled, setIsInstalled] = useState(false)
  
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }
    
    checkInstalled()
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addListener(checkInstalled)
    
    return () => mediaQuery.removeListener(checkInstalled)
  }, [])
  
  return isInstalled
}

// Hook para detectar conectividad
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}

// Utilidad para limpiar caché
export async function clearAppCache() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      const messageChannel = new MessageChannel()
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data)
        }
        
        registration.active?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        )
      })
    }
  }
}