/**
 * PWA Client Manager
 * Maneja el registro del Service Worker, instalación de la PWA,
 * y funcionalidades offline
 */

class PWAManager {
  constructor() {
    this.swRegistration = null;
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
    
    this.init();
  }

  /**
   * Inicializa el PWA Manager
   */
  async init() {
    // Verificar soporte de Service Workers
    if ('serviceWorker' in navigator) {
      await this.registerServiceWorker();
    } else {
      console.warn('Service Workers no soportados en este navegador');
    }

    // Escuchar evento de instalación de PWA
    this.setupInstallPrompt();

    // Monitorear estado de conexión
    this.setupConnectionMonitoring();

    // Solicitar permisos de notificaciones
    this.setupNotifications();

    // Configurar Background Sync
    this.setupBackgroundSync();
  }

  /**
   * Registra el Service Worker
   */
  async registerServiceWorker() {
    try {
      this.swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('✓ Service Worker registrado:', this.swRegistration.scope);

      // Verificar actualizaciones cada hora
      setInterval(() => {
        this.swRegistration.update();
      }, 60 * 60 * 1000);

      // Escuchar actualizaciones del SW
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration.installing;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateNotification();
          }
        });
      });

      // Recibir mensajes del SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Mensaje del SW:', event.data);
        this.handleServiceWorkerMessage(event.data);
      });

    } catch (error) {
      console.error('✗ Error al registrar Service Worker:', error);
    }
  }

  /**
   * Muestra notificación de actualización disponible
   */
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="pwa-update-content">
        <span>Nueva versión disponible</span>
        <button onclick="pwaManager.updateServiceWorker()">Actualizar</button>
        <button onclick="this.parentElement.parentElement.remove()">Después</button>
      </div>
    `;
    document.body.appendChild(notification);

    // Agregar estilos
    const style = document.createElement('style');
    style.textContent = `
      .pwa-update-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #323232;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideUp 0.3s ease;
      }
      .pwa-update-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .pwa-update-content button {
        background: #2196F3;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .pwa-update-content button:last-child {
        background: transparent;
        border: 1px solid white;
      }
      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Actualiza el Service Worker
   */
  updateServiceWorker() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  /**
   * Configura el prompt de instalación
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      
      // Mostrar botón de instalación
      this.showInstallButton();
      
      console.log('✓ PWA lista para instalarse');
    });

    // Detectar cuando la PWA se instaló
    window.addEventListener('appinstalled', () => {
      console.log('✓ PWA instalada correctamente');
      this.deferredPrompt = null;
      this.hideInstallButton();
    });
  }

  /**
   * Muestra el botón de instalación
   */
  showInstallButton() {
    const installBtn = document.getElementById('pwa-install-button');
    if (installBtn) {
      installBtn.style.display = 'block';
      installBtn.addEventListener('click', () => this.promptInstall());
    }
  }

  /**
   * Oculta el botón de instalación
   */
  hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-button');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  }

  /**
   * Muestra el prompt de instalación
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.warn('Prompt de instalación no disponible');
      return;
    }

    this.deferredPrompt.prompt();

    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✓ Usuario aceptó instalar la PWA');
    } else {
      console.log('✗ Usuario rechazó instalar la PWA');
    }

    this.deferredPrompt = null;
  }

  /**
   * Configura el monitoreo de conexión
   */
  setupConnectionMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleConnectionChange(true);
      console.log('✓ Conexión restaurada');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleConnectionChange(false);
      console.log('✗ Conexión perdida');
    });
  }

  /**
   * Maneja cambios en el estado de conexión
   */
  handleConnectionChange(isOnline) {
    // Emitir evento personalizado
    window.dispatchEvent(new CustomEvent('connectionchange', {
      detail: { isOnline }
    }));

    // Actualizar UI
    document.body.classList.toggle('offline', !isOnline);
    
    // Mostrar notificación
    this.showConnectionNotification(isOnline);

    // Si volvió la conexión, sincronizar datos
    if (isOnline) {
      this.syncOfflineData();
    }
  }

  /**
   * Muestra notificación de estado de conexión
   */
  showConnectionNotification(isOnline) {
    const notification = document.createElement('div');
    notification.className = `connection-notification ${isOnline ? 'online' : 'offline'}`;
    notification.textContent = isOnline 
      ? '✓ Conexión restaurada' 
      : '✗ Sin conexión - Modo offline';
    
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Configura las notificaciones push
   */
  async setupNotifications() {
    if (!('Notification' in window)) {
      console.warn('Notificaciones no soportadas');
      return;
    }

    if (Notification.permission === 'default') {
      // Esperar a que el usuario interactúe antes de pedir permisos
      console.log('Esperando interacción del usuario para pedir permisos de notificaciones');
    } else if (Notification.permission === 'granted') {
      await this.subscribeToNotifications();
    }
  }

  /**
   * Solicita permisos de notificaciones
   */
  async requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✓ Permisos de notificaciones concedidos');
      await this.subscribeToNotifications();
      return true;
    } else {
      console.log('✗ Permisos de notificaciones denegados');
      return false;
    }
  }

  /**
   * Suscribe a notificaciones push
   */
  async subscribeToNotifications() {
    if (!this.swRegistration) {
      console.error('Service Worker no registrado');
      return;
    }

    try {
      // Obtener clave pública VAPID del servidor
      const response = await fetch('/api/notifications/vapid-public-key');
      const { publicKey } = await response.json();

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });

      // Enviar suscripción al servidor
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscription)
      });

      console.log('✓ Suscrito a notificaciones push');
    } catch (error) {
      console.error('✗ Error al suscribirse a notificaciones:', error);
    }
  }

  /**
   * Convierte clave VAPID de Base64 a Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Configura Background Sync
   */
  setupBackgroundSync() {
    if (!('sync' in this.swRegistration)) {
      console.warn('Background Sync no soportado');
      return;
    }

    console.log('✓ Background Sync disponible');
  }

  /**
   * Registra una tarea de Background Sync
   */
  async registerBackgroundSync(tag) {
    try {
      await this.swRegistration.sync.register(tag);
      console.log(`✓ Background Sync registrado: ${tag}`);
    } catch (error) {
      console.error('✗ Error al registrar Background Sync:', error);
    }
  }

  /**
   * Sincroniza datos offline
   */
  async syncOfflineData() {
    if (this.swRegistration && 'sync' in this.swRegistration) {
      await this.registerBackgroundSync('sync-trips');
      await this.registerBackgroundSync('sync-notifications');
    }
  }

  /**
   * Maneja mensajes del Service Worker
   */
  handleServiceWorkerMessage(data) {
    if (data.type === 'CACHE_UPDATED') {
      console.log('Caché actualizado:', data.url);
    }
  }

  /**
   * Limpia el caché
   */
  async clearCache() {
    if (this.swRegistration) {
      this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
      console.log('✓ Caché limpiado');
    }
  }

  /**
   * Cachea URLs específicas
   */
  async cacheUrls(urls) {
    if (this.swRegistration) {
      this.swRegistration.active.postMessage({ 
        type: 'CACHE_URLS', 
        urls 
      });
      console.log('✓ URLs cacheadas:', urls);
    }
  }
}

// Crear instancia global
const pwaManager = new PWAManager();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAManager;
}
