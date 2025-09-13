'use client'

import { useEffect, useState } from 'react'
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'

interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

interface PerformanceData {
  webVitals: WebVitalsMetric[]
  pageLoadTime: number
  resourceCount: number
  memoryUsage?: MemoryInfo
  connectionType?: string
}

// Thresholds para Web Vitals (basados en las recomendaciones de Google)
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

function sendToAnalytics(metric: WebVitalsMetric) {
  // Enviar a Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.rating,
      value: Math.round(metric.value),
      custom_map: {
        metric_id: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
      },
    })
  }
  
  // Enviar a endpoint personalizado (opcional)
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    }).catch(console.error)
  }
}

function logToConsole(metric: WebVitalsMetric) {
  const color = {
    good: '#10B981',
    'needs-improvement': '#F59E0B', 
    poor: '#EF4444'
  }[metric.rating]
  
  console.log(
    `%c${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
    `color: ${color}; font-weight: bold;`
  )
}

export default function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    webVitals: [],
    pageLoadTime: 0,
    resourceCount: 0,
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Solo mostrar en desarrollo, nunca en producción para usuarios finales
    const showMonitor = process.env.NODE_ENV === 'development'
    setIsVisible(showMonitor)

    // Configurar Web Vitals
    const handleMetric = (metric: any) => {
      const webVitalMetric: WebVitalsMetric = {
        name: metric.name,
        value: metric.value,
        rating: getRating(metric.name, metric.value),
        timestamp: Date.now(),
      }
      
      setPerformanceData(prev => ({
        ...prev,
        webVitals: [...prev.webVitals.filter(m => m.name !== metric.name), webVitalMetric]
      }))
      
      logToConsole(webVitalMetric)
      sendToAnalytics(webVitalMetric)
    }

    // Registrar listeners para Web Vitals
    onCLS(handleMetric)
    onFCP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)

    // Métricas adicionales
    const measurePageLoad = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
        const resourceCount = performance.getEntriesByType('resource').length
        
        setPerformanceData(prev => ({
          ...prev,
          pageLoadTime,
          resourceCount,
        }))
      }
    }

    // Información de memoria (si está disponible)
    const measureMemory = () => {
      if ('memory' in performance) {
        setPerformanceData(prev => ({
          ...prev,
          memoryUsage: (performance as any).memory
        }))
      }
    }

    // Información de conexión
    const measureConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setPerformanceData(prev => ({
          ...prev,
          connectionType: connection.effectiveType || connection.type
        }))
      }
    }

    // Ejecutar mediciones
    setTimeout(() => {
      measurePageLoad()
      measureMemory()
      measureConnection()
    }, 1000)

    // Limpiar listeners
    return () => {
      // Los listeners de web-vitals se limpian automáticamente
    }
  }, [])

  // Hook para exponer métricas globalmente (útil para debugging)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Solo exponer datos en desarrollo
      if (process.env.NODE_ENV === 'development') {
        (window as any).getPerformanceData = () => performanceData;
      }
    }
  }, [performanceData])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">📊 Performance</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {/* Web Vitals */}
        <div className="space-y-2 mb-3">
          {performanceData.webVitals.map((metric) => (
            <div key={metric.name} className="flex justify-between items-center">
              <span className="font-medium">{metric.name}:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                metric.rating === 'good' ? 'bg-green-100 text-green-800' :
                metric.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {metric.value.toFixed(0)}{metric.name === 'CLS' ? '' : 'ms'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Métricas adicionales */}
        <div className="border-t border-gray-200 pt-3 space-y-1">
          <div className="flex justify-between">
            <span>Page Load:</span>
            <span>{performanceData.pageLoadTime.toFixed(0)}ms</span>
          </div>
          <div className="flex justify-between">
            <span>Resources:</span>
            <span>{performanceData.resourceCount}</span>
          </div>
          {performanceData.memoryUsage && (
            <div className="flex justify-between">
              <span>Memory:</span>
              <span>{(performanceData.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</span>
            </div>
          )}
          {performanceData.connectionType && (
            <div className="flex justify-between">
              <span>Connection:</span>
              <span className="capitalize">{performanceData.connectionType}</span>
            </div>
          )}
        </div>
        
        {/* Controles */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full text-xs bg-blue-50 text-blue-700 py-1 px-2 rounded hover:bg-blue-100 transition-colors"
          >
            🔄 Reload & Measure
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook personalizado para usar métricas de performance
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([])
  
  useEffect(() => {
    const handleMetric = (metric: any) => {
      const webVitalMetric: WebVitalsMetric = {
        name: metric.name,
        value: metric.value,
        rating: getRating(metric.name, metric.value),
        timestamp: Date.now(),
      }
      
      setMetrics(prev => [...prev.filter(m => m.name !== metric.name), webVitalMetric])
    }

    onCLS(handleMetric)
    onFCP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)
  }, [])
  
  return metrics
}

// Utilidad para reportar métricas personalizadas
export function reportCustomMetric(name: string, value: number, unit = 'ms') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'custom_metric', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(value),
      custom_map: {
        metric_name: name,
        metric_value: value,
        metric_unit: unit,
      },
    })
  }
  
  console.log(`%c${name}: ${value}${unit}`, 'color: #6366F1; font-weight: bold;')
}

// Declaración de tipos para gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}