import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Configuración de performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuración de sesiones
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Configuración del entorno
  environment: process.env.NODE_ENV,
  
  // Configuración básica de integrations
  integrations: [],
  
  // Filtros para reducir ruido
  beforeSend(event, hint) {
    // Filtrar en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event:', event)
    }
    // Filtrar errores conocidos que no son críticos
    const error = hint.originalException
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message as string
      
      // Filtrar errores de extensiones del navegador
      if (message.includes('extension') || message.includes('chrome-extension')) {
        return null
      }
      
      // Filtrar errores de red temporales
      if (message.includes('NetworkError') || message.includes('fetch')) {
        return null
      }
      
      // Filtrar errores de scripts externos
      if (message.includes('Script error')) {
        return null
      }
    }
    
    return event
  },
  
  // Configuración de tags por defecto
  initialScope: {
    tags: {
      component: 'client',
    },
  },
})

// Configurar contexto de usuario si está disponible
if (typeof window !== 'undefined') {
  // Obtener información del usuario desde localStorage o contexto
  const userInfo = localStorage.getItem('user-info')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
      })
    } catch (e) {
      // Ignorar errores de parsing
    }
  }
  
  // Configurar contexto adicional
  Sentry.setContext('browser', {
    name: navigator.userAgent,
    version: navigator.appVersion,
    language: navigator.language,
  })
  
  Sentry.setContext('screen', {
    width: window.screen.width,
    height: window.screen.height,
    orientation: window.screen.orientation?.type || 'unknown',
  })
}

// Exportar funciones útiles para el resto de la aplicación
export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const addBreadcrumb = Sentry.addBreadcrumb
export const setUser = Sentry.setUser
export const setContext = Sentry.setContext
export const setTag = Sentry.setTag