'use client'

import { useState, useEffect } from 'react'
import { X, Settings, Cookie, Shield, BarChart3, Target } from 'lucide-react'

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = 'cookie-consent'
const COOKIE_PREFERENCES_KEY = 'cookie-preferences'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
    
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true
    }
    
    setPreferences(allAccepted)
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted))
    setShowBanner(false)
    
    // Initialize analytics and marketing scripts
    initializeScripts(allAccepted)
  }

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    }
    
    setPreferences(essentialOnly)
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(essentialOnly))
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'customized')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences))
    setShowBanner(false)
    setShowPreferences(false)
    
    // Initialize scripts based on preferences
    initializeScripts(preferences)
  }

  const initializeScripts = (prefs: CookiePreferences) => {
    // Initialize Google Analytics if analytics is enabled
    if (prefs.analytics && typeof window !== 'undefined') {
      // Google Analytics initialization would go here
      console.log('Analytics cookies enabled')
    }
    
    // Initialize marketing scripts if marketing is enabled
    if (prefs.marketing && typeof window !== 'undefined') {
      // Facebook Pixel, Google Ads initialization would go here
      console.log('Marketing cookies enabled')
    }
  }

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🍪 Utilizamos Cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales 
                  para mejorar su experiencia, analizar el tráfico y personalizar el contenido. 
                  Puede gestionar sus preferencias en cualquier momento.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Al continuar navegando, acepta el uso de cookies esenciales. 
                  <a href="/cookies" className="text-blue-600 hover:text-blue-800 underline ml-1">
                    Más información
                  </a>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
              <button
                onClick={() => setShowPreferences(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                Personalizar
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Solo Esenciales
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Aceptar Todas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowPreferences(false)} />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Preferencias de Cookies
                </h2>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <p className="text-gray-600">
                  Gestione sus preferencias de cookies. Puede cambiar estas configuraciones en cualquier momento.
                </p>
                
                {/* Essential Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium text-gray-900">Cookies Esenciales</h3>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Siempre Activas
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Estas cookies son necesarias para el funcionamiento básico del sitio web, 
                    incluyendo seguridad, navegación y funciones del carrito de compras.
                  </p>
                </div>
                
                {/* Functional Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium text-gray-900">Cookies de Funcionalidad</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={() => handlePreferenceChange('functional')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Mejoran la funcionalidad del sitio recordando sus preferencias, 
                    productos favoritos y configuraciones personales.
                  </p>
                </div>
                
                {/* Analytics Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium text-gray-900">Cookies de Análisis</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={() => handlePreferenceChange('analytics')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio 
                    para mejorar la experiencia de usuario (Google Analytics).
                  </p>
                </div>
                
                {/* Marketing Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-500" />
                      <h3 className="font-medium text-gray-900">Cookies de Marketing</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={() => handlePreferenceChange('marketing')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Se utilizan para mostrar anuncios relevantes y medir la efectividad 
                    de nuestras campañas publicitarias (Facebook Pixel, Google Ads).
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Guardar Preferencias
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Hook to check cookie preferences
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  
  useEffect(() => {
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }
  }, [])
  
  return preferences
}

// Utility function to check if specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false
  
  const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
  if (!savedPreferences) return false
  
  const preferences: CookiePreferences = JSON.parse(savedPreferences)
  return preferences[type] || false
}