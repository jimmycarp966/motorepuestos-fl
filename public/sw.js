const CACHE_NAME = 'motorepuestos-v1.0.1';
const STATIC_CACHE = 'static-v1.0.1';
const DYNAMIC_CACHE = 'dynamic-v1.0.1';

// Archivos que se cachean inmediatamente
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-sistemas.png',
  '/favicon.ico'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker instalado');
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activado');
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia: Network First para API calls, Cache First para archivos estáticos
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    // Para llamadas a la API, intentar red primero, luego cache
    event.respondWith(networkFirst(request));
  } else {
    // Para archivos estáticos, cache primero, luego red
    event.respondWith(cacheFirst(request));
  }
});

// Estrategia Network First
async function networkFirst(request) {
  try {
    // Intentar red primero
    const networkResponse = await fetch(request);
    
    // Si la respuesta es exitosa, guardar en cache
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Red falló, usando cache:', error);
    
    // Si la red falla, intentar cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay cache, devolver error offline
    return new Response(
      JSON.stringify({ 
        error: 'Sin conexión a internet',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estrategia Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Error al obtener recurso:', error);
    
    // Para archivos HTML, devolver página offline
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Sincronización en background
self.addEventListener('sync', (event) => {
  console.log('Sincronización en background:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Función para sincronizar datos
async function syncData() {
  try {
    // Aquí implementaremos la lógica de sincronización
    // cuando tengamos el sistema de IndexedDB listo
    console.log('Sincronizando datos...');
    
    // Notificar a todos los clientes
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Error en sincronización:', error);
  }
}

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    default:
      console.log('Mensaje no manejado:', type);
  }
});
