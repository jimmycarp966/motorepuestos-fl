// ================================================
// SERVICE WORKER PARA FUNCIONALIDAD OFFLINE
// ================================================

const CACHE_NAME = 'motorepuestos-v1.0.1'
const OFFLINE_URL = '/offline.html'

// Recursos críticos que se cachean siempre
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo-sistemas.png',
  OFFLINE_URL
]

// Patrones de URL que deben funcionar offline
const CACHE_PATTERNS = [
  /^.*\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
  /^.*\/static\//,
  /^.*\/assets\//
]

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('🔧 [SW] Instalando Service Worker')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🔧 [SW] Cacheando recursos críticos')
        return cache.addAll(CRITICAL_RESOURCES)
      })
      .then(() => {
        // Forzar activación inmediata
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('🔧 [SW] Error durante instalación:', error)
      })
  )
})

// Activar Service Worker
self.addEventListener('activate', event => {
  console.log('🔧 [SW] Activando Service Worker')
  
  event.waitUntil(
    // Limpiar caches antiguas
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🔧 [SW] Eliminando cache antigua:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // Tomar control inmediato
      return self.clients.claim()
    })
  )
})

// Interceptar peticiones de red
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Solo manejar peticiones GET del mismo origen
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return
  }

  // Estrategia Cache First para recursos estáticos
  if (shouldCacheResource(request.url)) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Estrategia Network First para API y páginas
  if (isApiRequest(request.url) || isPageRequest(request.url)) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Para todo lo demás, usar la red normalmente
})

// Verificar si un recurso debe ser cacheado
function shouldCacheResource(url) {
  return CACHE_PATTERNS.some(pattern => pattern.test(url))
}

// Verificar si es una petición de API
function isApiRequest(url) {
  return url.includes('/api/') || 
         url.includes('supabase.co') ||
         url.includes('/rest/v1/')
}

// Verificar si es una petición de página
function isPageRequest(url) {
  const urlObj = new URL(url)
  return urlObj.pathname.startsWith('/') && 
         !url.includes('.') && 
         !isApiRequest(url)
}

// Estrategia Cache First (para recursos estáticos)
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('🔧 [SW] Cache hit:', request.url)
      return cachedResponse
    }

    // Si no está en cache, buscar en red y cachear
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
      console.log('🔧 [SW] Recurso cacheado:', request.url)
    }
    
    return networkResponse
  } catch (error) {
    console.error('🔧 [SW] Error en cache first:', error)
    
    // Si falla todo, retornar página offline para navegación
    if (isPageRequest(request.url)) {
      const cache = await caches.open(CACHE_NAME)
      return cache.match(OFFLINE_URL)
    }
    
    throw error
  }
}

// Estrategia Network First (para API y páginas dinámicas)
async function networkFirstStrategy(request) {
  try {
    // Intentar red primero
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cachear respuesta exitosa
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
      console.log('🔧 [SW] Respuesta de red cacheada:', request.url)
    }
    
    return networkResponse
  } catch (error) {
    console.log('🔧 [SW] Red falló, buscando en cache:', request.url)
    
    // Si falla la red, buscar en cache
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('🔧 [SW] Usando respuesta cacheada:', request.url)
      return cachedResponse
    }

    // Si es una página y no hay cache, mostrar página offline
    if (isPageRequest(request.url)) {
      console.log('🔧 [SW] Mostrando página offline')
      return cache.match(OFFLINE_URL)
    }

    // Para APIs, crear respuesta de error estructurada
    if (isApiRequest(request.url)) {
      return new Response(
        JSON.stringify({
          error: 'Sin conexión',
          message: 'Esta funcionalidad requiere conexión a internet',
          offline: true
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    throw error
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urls)
    }).then(() => {
      event.ports[0].postMessage({ success: true })
    }).catch(error => {
      event.ports[0].postMessage({ success: false, error: error.message })
    })
  }
})

// Sincronización en background (experimental)
self.addEventListener('sync', event => {
  if (event.tag === 'offline-sync') {
    console.log('🔧 [SW] Iniciando sincronización en background')
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  try {
    // Notificar a la aplicación principal para que sincronice
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        timestamp: Date.now()
      })
    })
  } catch (error) {
    console.error('🔧 [SW] Error en sincronización background:', error)
  }
}

console.log('🔧 [SW] Service Worker cargado:', CACHE_NAME)