import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Configuración específica para Edge Runtime
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuración del entorno
  environment: process.env.NODE_ENV,
  
  // Edge Runtime tiene limitaciones, usar integraciones mínimas
  integrations: [],
  
  // Configuración de tags por defecto para edge
  initialScope: {
    tags: {
      component: 'edge',
      runtime: 'edge',
    },
  },
  
  // Filtros específicos para edge
  beforeSend(event, hint) {
    // En edge runtime, ser más conservador con los logs
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Edge Event:', event)
    }
    
    return event
  },
})

// Configurar contexto mínimo para edge
Sentry.setContext('edge', {
  runtime: 'edge',
  timestamp: Date.now(),
})

// Exportar funciones útiles para edge
export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const setContext = Sentry.setContext
export const setTag = Sentry.setTag