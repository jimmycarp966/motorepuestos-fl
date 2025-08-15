// Service Worker para optimización de rendimiento
const VERSION = 'v6';
const CACHE_NAME = `carniceria-${VERSION}`;
const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

// Archivos estáticos para cachear
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('Error cacheando archivos:', error);
      })
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Eliminando cache obsoleto:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => {
        // Forzar una recarga única de las pestañas controladas para tomar el nuevo HTML/JS
        clients.forEach((client) => {
          try {
            client.navigate(client.url);
          } catch (e) {}
        });
      })
  );
  self.skipWaiting();
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // No interceptar canales streaming de Firestore (Listen/Write)
  if (
    url.host.includes('firestore.googleapis.com') &&
    (url.pathname.includes('/google.firestore.v1.Firestore/Listen/') ||
     url.pathname.includes('/google.firestore.v1.Firestore/Write/'))
  ) {
    return; // dejar que el navegador maneje directamente
  }

  // Navegación (HTML): Network First con no-store, fallback a cache para offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          // Opcional: cachear como fallback offline
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put('/', clone).catch(() => {}));
          return response;
        })
        .catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // Evitar cache para JS y CSS para prevenir errores de versiones
  if (
    request.destination === 'script' ||
    url.pathname.includes('/static/js/') ||
    request.destination === 'style' ||
    url.pathname.includes('/static/css/')
  ) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => caches.match(request))
    );
    return;
  }

  // Estrategia: Cache First para archivos estáticos
  if (request.method === 'GET' && isStaticFile(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((fetchResponse) => {
              // Cachear respuesta exitosa
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              
              return fetchResponse;
            });
        })
        .catch(() => {
          // Fallback para archivos estáticos
          if (url.pathname === '/') {
            return caches.match('/index.html');
          }
        })
    );
  }
  
  // Estrategia: Network First para API calls
  else if (isApiCall(url.href)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuestas exitosas de la API
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback a cache para API calls
          return caches.match(request);
        })
    );
  }
  
  // Estrategia: Stale While Revalidate para otros recursos
  else {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(request, { cache: 'no-store' })
            .then((networkResponse) => {
              // Cachear nueva respuesta
              if (networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              
              return networkResponse;
            })
            .catch(() => {
              // Si falla la red, usar cache
              return cachedResponse;
            });
          
          return cachedResponse || fetchPromise;
        })
    );
  }
});

// Función para identificar archivos estáticos
function isStaticFile(pathname) {
  return pathname.includes('/manifest.json') ||
         pathname.includes('/favicon.ico') ||
         pathname === '/';
}

// Función para identificar llamadas a API
function isApiCall(href) {
  try {
    const u = new URL(href);
    const host = u.host;
    const path = u.pathname;
    // Ignorar completamente canales de Firestore Listen (evitar interferir realtime)
    if (path.includes('/google.firestore.v1.Firestore/Listen/')) return false;
    return path.includes('/api/') ||
           host.includes('firebase') ||
           host.includes('googleapis') ||
           host.includes('gstatic.com') ||
           host.includes('firestore.googleapis.com');
  } catch (e) {
    return false;
  }
}

// Función para limpiar cache antiguo
function cleanOldCaches() {
  return caches.keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    });
}

// Mensajes del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(cleanOldCaches());
  }
});

// Manejo de errores
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
}); 