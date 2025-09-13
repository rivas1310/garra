// Service Worker para PWA - Garras Felinas
const CACHE_NAME = 'garras-felinas-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'
const IMAGE_CACHE = 'images-v1'

// Recursos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/_next/static/css/app/layout.css',
  '/_next/static/css/app/globals.css'
]

// Recursos dinámicos importantes
const IMPORTANT_PAGES = [
  '/',
  '/productos',
  '/categorias',
  '/carrito',
  '/perfil',
  '/contacto'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error)
      })
  )
  
  // Forzar la activación inmediata
  self.skipWaiting()
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar cachés antiguos
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        // Tomar control de todas las pestañas
        return self.clients.claim()
      })
  )
})

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Solo manejar peticiones HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Estrategia para diferentes tipos de recursos
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request))
  } else if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request))
  } else if (request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(request))
  } else if (request.destination === 'script' || 
             request.destination === 'style' ||
             request.url.includes('/_next/static/')) {
    event.respondWith(handleStaticRequest(request))
  } else {
    event.respondWith(handleOtherRequest(request))
  }
})

// Manejar peticiones de imágenes - Cache First
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Solo cachear imágenes exitosas
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Service Worker: Error handling image request', error)
    // Retornar imagen placeholder si está disponible
    return caches.match('/images/placeholder.jpg') || 
           new Response('Image not available', { status: 404 })
  }
}

// Manejar peticiones de páginas - Network First con fallback
async function handlePageRequest(request) {
  try {
    // Intentar red primero
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cachear páginas importantes
      const url = new URL(request.url)
      if (IMPORTANT_PAGES.some(page => url.pathname === page || url.pathname.startsWith(page))) {
        const cache = await caches.open(DYNAMIC_CACHE)
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error)
    
    // Buscar en caché
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback a página offline
    const offlinePage = await caches.match('/offline')
    if (offlinePage) {
      return offlinePage
    }
    
    // Respuesta de emergencia
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Sin Conexión - Garras Felinas</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #e74c3c; }
            p { color: #666; line-height: 1.6; }
            button {
              background: #3498db;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            }
            button:hover { background: #2980b9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🦁 Sin Conexión</h1>
            <p>No hay conexión a internet disponible.</p>
            <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
            <button onclick="window.location.reload()">Reintentar</button>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    )
  }
}

// Manejar peticiones de API - Network Only con timeout
async function handleApiRequest(request) {
  try {
    // Timeout para peticiones API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos
    
    const response = await fetch(request, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    console.error('Service Worker: API request failed', error)
    
    // Respuesta de error para APIs
    return new Response(
      JSON.stringify({
        error: 'Sin conexión',
        message: 'No se pudo conectar con el servidor. Intenta más tarde.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Manejar recursos estáticos - Cache First
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Service Worker: Error handling static request', error)
    return new Response('Resource not available', { status: 404 })
  }
}

// Manejar otras peticiones - Network First
async function handleOtherRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Not available offline', { status: 404 })
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})

// Limpiar todos los cachés
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  )
}

// Manejar notificaciones push (para futuras implementaciones)
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Productos',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/productos')
    )
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
  } else {
    // Clic en la notificación principal
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

console.log('Service Worker: Loaded successfully')