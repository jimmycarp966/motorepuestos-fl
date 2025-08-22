const CACHE_NAME = 'motorepuestos-v1.0.1';
const STATIC_CACHE = 'static-v1.0.1';
const DYNAMIC_CACHE = 'dynamic-v1.0.1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/favicon.ico',
  '/logo-sistemas.png'
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

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Service Worker: Cacheando archivos estáticos');
      return cache.addAll(STATIC_FILES);
    }).then(() => {
      console.log('✅ Service Worker: Instalación completada');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ Service Worker: Error en instalación:', error);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activación completada');
      return self.clients.claim();
    }).catch((error) => {
      console.error('❌ Service Worker: Error en activación:', error);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests de analytics, extensiones de Chrome y métodos no GET
  if (url.pathname.includes('analytics') || 
      url.pathname.includes('tracking') ||
      url.protocol === 'chrome-extension:' ||
      url.protocol === 'moz-extension:' ||
      url.protocol === 'ms-browser-extension:' ||
      request.method !== 'GET') {
    return;
  }

  // Cache First para archivos estáticos
  if (request.method === 'GET' &&
      (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') ||
       url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') ||
       url.pathname.endsWith('.ico') || url.pathname.endsWith('.svg'))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network First para APIs
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache First para navegación
  if (request.mode === 'navigate') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network First para todo lo demás
  event.respondWith(networkFirst(request));
});

self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync iniciado:', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncData().then(() => {
        console.log('✅ Service Worker: Background sync completado');
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SYNC_COMPLETED', timestamp: new Date().toISOString() });
          });
        });
      }).catch((error) => {
        console.error('❌ Service Worker: Error en background sync:', error);
      })
    );
  }
});

async function syncData() {
  console.log('📡 Service Worker: Sincronizando datos...');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
  return true;
}

self.addEventListener('message', (event) => {
  console.log('📨 Service Worker: Mensaje recibido:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Manejo de notificaciones push (opcional)
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Notificación push recibida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/favicon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Motorepuestos FL', options)
  );
});

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
