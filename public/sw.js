const CACHE_NAME = 'motorepuestos-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Archivos estáticos para cachear
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-sistemas.png',
  '/favicon.ico',
  '/favicon.png'
];

// Estrategia Cache First para archivos estáticos
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Solo cachear respuestas exitosas y completas
    if (networkResponse.ok && networkResponse.status !== 206) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Error en cacheFirst:', error);
    return new Response('Error de red', { status: 503 });
  }
}

// Estrategia Network First para APIs
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Solo cachear respuestas exitosas y completas
    if (networkResponse.ok && networkResponse.status !== 206) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📡 Service Worker: Red no disponible, usando cache');
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Sin conexión', { status: 503 });
  }
}

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activación completada');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en activación:', error);
      })
  );
});

// Interceptar fetch requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests de analytics o tracking
  if (url.pathname.includes('analytics') || url.pathname.includes('tracking')) {
    return;
  }

  // Cache First para archivos estáticos
  if (request.method === 'GET' && 
      (url.pathname.endsWith('.js') || 
       url.pathname.endsWith('.css') || 
       url.pathname.endsWith('.png') || 
       url.pathname.endsWith('.jpg') || 
       url.pathname.endsWith('.ico') ||
       url.pathname.endsWith('.svg'))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network First para API calls
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache First para navegación
  if (request.mode === 'navigate') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Para otros requests, usar Network First
  event.respondWith(networkFirst(request));
});

// Background Sync para sincronización offline
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync iniciado:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncData()
        .then(() => {
          console.log('✅ Service Worker: Background sync completado');
          // Notificar a todos los clientes
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'SYNC_COMPLETED',
                timestamp: new Date().toISOString()
              });
            });
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker: Error en background sync:', error);
        })
    );
  }
});

// Función para sincronizar datos
async function syncData() {
  try {
    // Aquí iría la lógica de sincronización con Supabase
    console.log('📡 Service Worker: Sincronizando datos...');
    
    // Simular sincronización
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('❌ Service Worker: Error sincronizando:', error);
    throw error;
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker: Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Push notifications (opcional)
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push notification recibida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación del sistema',
    icon: '/logo-sistemas.png',
    badge: '/logo-sistemas.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/logo-sistemas.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/logo-sistemas.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Sistema Motorepuestos', options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notificación clickeada');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('✅ Service Worker: Cargado correctamente');
