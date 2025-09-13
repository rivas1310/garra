'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  eventId?: string
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para mostrar la UI de error
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Capturar el error con Sentry
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        component: 'ErrorBoundary',
      },
    })

    this.setState({
      error,
      errorInfo,
      eventId,
    })

    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportBug = () => {
    if (this.state.eventId) {
      // Abrir formulario de reporte de Sentry
      Sentry.showReportDialog({ eventId: this.state.eventId })
    }
  }

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback
      }

      // UI de error por defecto
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              {/* Icono de error */}
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              
              {/* Título y descripción */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                🦁 ¡Ups! Algo salió mal
              </h1>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado 
                y trabajaremos para solucionarlo pronto.
              </p>
              
              {/* Información técnica (solo en desarrollo) */}
              {this.props.showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                    🔧 Detalles técnicos:
                  </h3>
                  <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border overflow-auto max-h-32">
                    <div className="text-red-600 font-semibold mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div className="text-gray-500 whitespace-pre-wrap">
                        {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* ID del evento de Sentry */}
              {this.state.eventId && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm">
                    📋 ID del reporte:
                  </h3>
                  <code className="text-xs text-blue-700 bg-white px-2 py-1 rounded">
                    {this.state.eventId}
                  </code>
                </div>
              )}
              
              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recargar Página
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    Ir al Inicio
                  </button>
                  
                  {this.state.eventId && (
                    <button
                      onClick={this.handleReportBug}
                      className="flex items-center justify-center gap-2 bg-orange-100 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                    >
                      <Bug className="h-4 w-4" />
                      Reportar
                    </button>
                  )}
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Si el problema persiste, puedes contactarnos en{' '}
                  <a 
                    href="mailto:soporte@garrasfelinas.com" 
                    className="text-blue-600 hover:underline"
                  >
                    soporte@garrasfelinas.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Hook para capturar errores en componentes funcionales
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    Sentry.captureException(error, {
      extra: errorInfo,
      tags: {
        component: 'useErrorHandler',
      },
    })
  }
}

// Componente de error simple para casos específicos
export function SimpleErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Error en el componente</h3>
          <p className="text-sm text-red-700 mt-1">
            {error.message || 'Ha ocurrido un error inesperado'}
          </p>
        </div>
        <button
          onClick={resetError}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}

// HOC para envolver componentes con ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}