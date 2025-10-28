// Service Worker para PWA de Transporte
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `transporte-pwa-${CACHE_VERSION}`;

// Archivos estáticos a cachear en la instalación
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/css/styles.css',
  '/js/app.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints que se cachean dinámicamente
const API_CACHE_URLS = [
  '/api/routes',
  '/api/trips',
  '/api/vehicles',
  '/api/notifications'
];

// Estrategias de caché
const CACHE_STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Configuración de timeouts
const NETWORK_TIMEOUT = 5000;
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 horas

// ============================================
// INSTALACIÓN DEL SERVICE WORKER
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando archivos estáticos');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Service Worker instalado correctamente');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('[SW] Error al instalar:', error);
      })
  );
});

// ============================================
// ACTIVACIÓN DEL SERVICE WORKER
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar cachés antiguos
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activado');
        return self.clients.claim(); // Tomar control de todas las páginas
      })
  );
});

// ============================================
// INTERCEPTAR PETICIONES (FETCH)
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones no HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Determinar estrategia según el tipo de petición
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API: Network First con fallback a caché
      event.respondWith(networkFirstStrategy(request));
    } else if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
      // Imágenes: Cache First
      event.respondWith(cacheFirstStrategy(request));
    } else if (url.pathname.match(/\.(css|js)$/)) {
      // CSS/JS: Stale While Revalidate
      event.respondWith(staleWhileRevalidateStrategy(request));
    } else {
      // HTML: Network First
      event.respondWith(networkFirstStrategy(request));
    }
  } else {
    // POST, PUT, DELETE: Network Only
    event.respondWith(networkOnlyStrategy(request));
  }
});

// ============================================
// ESTRATEGIA: NETWORK FIRST
// ============================================
async function networkFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Intentar obtener de la red con timeout
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ]);

    // Si la respuesta es válida, cachearla
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, usando caché:', request.url);
    
    // Intentar obtener de caché
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no hay caché y es HTML, mostrar página offline
    if (request.headers.get('accept').includes('text/html')) {
      return cache.match('/offline.html');
    }

    // Para API, devolver respuesta offline
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'Sin conexión', 
          offline: true,
          message: 'Los datos no están disponibles sin conexión'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    throw error;
  }
}

// ============================================
// ESTRATEGIA: CACHE FIRST
// ============================================
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Verificar edad del caché
    const cacheDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    
    if (now - cacheDate < MAX_CACHE_AGE) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// ============================================
// ESTRATEGIA: STALE WHILE REVALIDATE
// ============================================
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Actualizar caché en segundo plano
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  // Devolver caché inmediatamente si existe
  return cachedResponse || fetchPromise;
}

// ============================================
// ESTRATEGIA: NETWORK ONLY
// ============================================
async function networkOnlyStrategy(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Sin conexión', 
        message: 'Esta operación requiere conexión a internet'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification recibida');

  let notificationData = {
    title: 'Transporte',
    body: 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || 'notification',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [],
        data: data.data || {}
      };
    } catch (error) {
      console.error('[SW] Error al parsear push data:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data,
      vibrate: [200, 100, 200]
    })
  );
});

// ============================================
// CLICK EN NOTIFICACIÓN
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificación clickeada:', event.notification.tag);

  event.notification.close();

  // Determinar URL según la acción
  let targetUrl = '/';
  
  if (event.action) {
    // Si se clickeó un botón de acción
    targetUrl = event.action;
  } else if (event.notification.data && event.notification.data.url) {
    // Si hay URL en los datos
    targetUrl = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Buscar si ya hay una ventana abierta
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-trips') {
    event.waitUntil(syncTrips());
  } else if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncTrips() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const pendingTrips = await getPendingTrips();

    for (const trip of pendingTrips) {
      await fetch('/api/trips/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip)
      });
    }

    console.log('[SW] Trips sincronizados correctamente');
  } catch (error) {
    console.error('[SW] Error al sincronizar trips:', error);
    throw error;
  }
}

async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications?unread=true');
    const notifications = await response.json();

    if (notifications.length > 0) {
      await self.registration.showNotification('Nuevas notificaciones', {
        body: `Tienes ${notifications.length} notificaciones sin leer`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'notifications-sync'
      });
    }

    console.log('[SW] Notificaciones sincronizadas');
  } catch (error) {
    console.error('[SW] Error al sincronizar notificaciones:', error);
  }
}

// ============================================
// HELPERS
// ============================================
async function getPendingTrips() {
  // Esta función debería obtener trips pendientes de IndexedDB
  // Por ahora retorna array vacío
  return [];
}

// ============================================
// MENSAJES DESDE LA APLICACIÓN
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW] Mensaje recibido:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('[SW] Service Worker cargado:', CACHE_VERSION);
