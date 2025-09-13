import { NextRequest, NextResponse } from 'next/server'

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

interface WebVitalPayload {
  metric: WebVitalMetric
  url: string
  userAgent: string
  timestamp: number
}

// En un entorno de producción, aquí conectarías con tu base de datos
// o servicio de analytics (como Google Analytics, Mixpanel, etc.)
const metricsStore: WebVitalPayload[] = []

export async function POST(request: NextRequest) {
  try {
    const payload: WebVitalPayload = await request.json()
    
    // Validar el payload
    if (!payload.metric || !payload.url || !payload.userAgent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validar métrica
    const validMetrics = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB']
    if (!validMetrics.includes(payload.metric.name)) {
      return NextResponse.json(
        { error: 'Invalid metric name' },
        { status: 400 }
      )
    }
    
    // Agregar información adicional
    const enrichedMetric = {
      ...payload,
      receivedAt: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      headers: {
        'user-agent': request.headers.get('user-agent') || '',
        'referer': request.headers.get('referer') || '',
      },
    }
    
    // Almacenar en memoria (en producción usar base de datos)
    metricsStore.push(enrichedMetric)
    
    // Mantener solo las últimas 1000 métricas en memoria
    if (metricsStore.length > 1000) {
      metricsStore.splice(0, metricsStore.length - 1000)
    }
    
    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vital received:', {
        metric: payload.metric.name,
        value: payload.metric.value,
        rating: payload.metric.rating,
        url: payload.url
      })
    }
    
    // Aquí podrías enviar a servicios externos
    await sendToExternalServices(enrichedMetric)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error processing web vital:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const metric = searchParams.get('metric')
    const rating = searchParams.get('rating')
    
    let filteredMetrics = [...metricsStore]
    
    // Filtrar por métrica específica
    if (metric) {
      filteredMetrics = filteredMetrics.filter(m => m.metric.name === metric)
    }
    
    // Filtrar por rating
    if (rating) {
      filteredMetrics = filteredMetrics.filter(m => m.metric.rating === rating)
    }
    
    // Ordenar por timestamp descendente
    filteredMetrics.sort((a, b) => b.timestamp - a.timestamp)
    
    // Limitar resultados
    const limitedMetrics = filteredMetrics.slice(0, limit)
    
    // Calcular estadísticas
    const stats = calculateStats(filteredMetrics)
    
    return NextResponse.json({
      metrics: limitedMetrics,
      stats,
      total: filteredMetrics.length
    })
    
  } catch (error) {
    console.error('Error fetching web vitals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Función para enviar métricas a servicios externos
async function sendToExternalServices(payload: any) {
  // Ejemplo: Enviar a Google Analytics
  if (process.env.GA_MEASUREMENT_ID) {
    try {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: 'web-vitals-client',
          events: [{
            name: 'web_vital',
            params: {
              metric_name: payload.metric.name,
              metric_value: payload.metric.value,
              metric_rating: payload.metric.rating,
              page_location: payload.url
            }
          }]
        })
      })
    } catch (error) {
      console.error('Error sending to GA:', error)
    }
  }
  
  // Ejemplo: Enviar a Sentry (si está configurado)
  if (process.env.SENTRY_DSN) {
    // Aquí integrarías con Sentry para métricas de performance
  }
  
  // Ejemplo: Webhook personalizado
  if (process.env.WEBHOOK_URL) {
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Error sending to webhook:', error)
    }
  }
}

// Función para calcular estadísticas
function calculateStats(metrics: WebVitalPayload[]) {
  const metricsByName = metrics.reduce((acc, m) => {
    if (!acc[m.metric.name]) {
      acc[m.metric.name] = []
    }
    acc[m.metric.name].push(m.metric.value)
    return acc
  }, {} as Record<string, number[]>)
  
  const stats: Record<string, any> = {}
  
  Object.entries(metricsByName).forEach(([name, values]) => {
    if (values.length === 0) return
    
    const sorted = values.sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)
    
    stats[name] = {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      ratings: {
        good: values.filter(v => {
          const thresholds = {
            CLS: 0.1,
            FID: 100,
            FCP: 1800,
            LCP: 2500,
            TTFB: 800
          }
          return v <= (thresholds[name as keyof typeof thresholds] || 0)
        }).length,
        needsImprovement: values.filter(v => {
          const goodThresholds = {
            CLS: 0.1,
            FID: 100,
            FCP: 1800,
            LCP: 2500,
            TTFB: 800
          }
          const poorThresholds = {
            CLS: 0.25,
            FID: 300,
            FCP: 3000,
            LCP: 4000,
            TTFB: 1800
          }
          const good = goodThresholds[name as keyof typeof goodThresholds] || 0
          const poor = poorThresholds[name as keyof typeof poorThresholds] || Infinity
          return v > good && v <= poor
        }).length,
        poor: values.filter(v => {
          const poorThresholds = {
            CLS: 0.25,
            FID: 300,
            FCP: 3000,
            LCP: 4000,
            TTFB: 1800
          }
          return v > (poorThresholds[name as keyof typeof poorThresholds] || Infinity)
        }).length
      }
    }
  })
  
  return stats
}