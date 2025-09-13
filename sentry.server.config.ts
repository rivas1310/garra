import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Configuración de performance para servidor
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuración del entorno
  environment: process.env.NODE_ENV,
  
  // Configuración básica de integrations para servidor
  integrations: [],
  
  // Configuración de sampling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Filtros para el servidor
  beforeSend(event, hint) {
    // Filtrar errores de desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event:', event)
    }
    
    const error = hint.originalException
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message as string
      
      // Filtrar errores de conexión de base de datos temporales
      if (message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
        return null
      }
      
      // Filtrar errores de rate limiting
      if (message.includes('rate limit') || message.includes('429')) {
        return null
      }
    }
    
    return event
  },
  
  // Configuración de tags por defecto para servidor
  initialScope: {
    tags: {
      component: 'server',
      runtime: 'nodejs',
    },
  },
})

// Configurar contexto del servidor
Sentry.setContext('server', {
  node_version: process.version,
  platform: process.platform,
  arch: process.arch,
  memory: process.memoryUsage(),
})

// Middleware para capturar errores de API routes
export function withSentryAPI(handler: any) {
  return async (req: any, res: any) => {
    try {
      // Configurar contexto de la request
      Sentry.setContext('request', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: req.query,
      })
      
      return await handler(req, res)
    } catch (error) {
      // Capturar el error con contexto adicional
      Sentry.withScope((scope) => {
        scope.setTag('api_route', req.url)
        scope.setContext('request_body', req.body)
        Sentry.captureException(error)
      })
      
      throw error
    }
  }
}

// Función para capturar errores de base de datos
export function captureDBError(error: Error, operation: string, table?: string) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'database')
    scope.setTag('db_operation', operation)
    if (table) scope.setTag('db_table', table)
    scope.setLevel('error')
    Sentry.captureException(error)
  })
}

// Función para capturar errores de servicios externos
export function captureServiceError(error: Error, service: string, endpoint?: string) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'external_service')
    scope.setTag('service_name', service)
    if (endpoint) scope.setTag('service_endpoint', endpoint)
    scope.setLevel('warning')
    Sentry.captureException(error)
  })
}

// Exportar funciones útiles
export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const addBreadcrumb = Sentry.addBreadcrumb
export const setContext = Sentry.setContext
export const setTag = Sentry.setTag
export const withScope = Sentry.withScope