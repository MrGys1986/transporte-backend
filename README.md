# Backend PWA - Sistema de Transporte 🚍

Backend completo para Progressive Web Application (PWA) del sistema de transporte urbano con capacidades offline, notificaciones push y sincronización en tiempo real.

## 📋 Características

### Backend API
- ✅ **API REST** completa con Express.js
- ✅ **Autenticación JWT** con roles (admin, conductor, pasajero)
- ✅ **Base de datos PostgreSQL** con migraciones y seeds
- ✅ **Cache Redis** para alto rendimiento
- ✅ **Rate Limiting** y seguridad con Helmet
- ✅ **Logging** estructurado con Winston
- ✅ **Geolocalización** en tiempo real con Google Maps API

### PWA Features
- ✅ **Service Worker** con estrategias de caché inteligentes
- ✅ **Manifest.json** configurado para instalación
- ✅ **Notificaciones Push** con Web Push API y VAPID
- ✅ **Offline Support** con fallback a página offline
- ✅ **Background Sync** para sincronización de datos
- ✅ **Cache-First** para recursos estáticos
- ✅ **Network-First** para datos dinámicos
- ✅ **Stale-While-Revalidate** para CSS/JS

## 🚀 Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Generar claves VAPID para push notifications
npm run generate-vapid

# 4. Ejecutar migraciones de base de datos
npm run migrate

# 5. (Opcional) Cargar datos de prueba
npm run seed

# 6. Iniciar servidor
npm run dev
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=transporte_db

# JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# VAPID (Push Notifications)
VAPID_PUBLIC_KEY=tu_clave_publica_vapid
VAPID_PRIVATE_KEY=tu_clave_privada_vapid
VAPID_SUBJECT=mailto:tu@email.com

# APIs Externas
GOOGLE_MAPS_API_KEY=tu_api_key_google_maps
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu@email.com
EMAIL_PASSWORD=tu_password_email
```

## 📁 Estructura del Proyecto

```
backend_pwa_skeleton/
├── public/                    # Archivos estáticos para PWA
│   ├── manifest.json         # Manifest PWA
│   ├── service-worker.js     # Service Worker
│   ├── pwa-manager.js        # Manager del lado del cliente
│   ├── offline.html          # Página offline
│   └── icons/                # Iconos PWA (ver public/icons/README.md)
├── src/
│   ├── config/               # Configuraciones
│   ├── controllers/          # Controladores de API
│   ├── models/               # Modelos de datos
│   ├── services/             # Lógica de negocio
│   ├── middleware/           # Middleware (auth, cache, etc.)
│   ├── routes/               # Rutas de API
│   ├── utils/                # Utilidades
│   ├── database/             # Conexión, migraciones, seeds
│   └── validators/           # Validación de datos
├── scripts/                  # Scripts utilitarios
├── tests/                    # Tests unitarios e integración
└── docs/                     # Documentación

```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar con nodemon

# Producción
npm start                # Iniciar servidor

# Base de datos
npm run migrate          # Ejecutar migraciones
npm run seed             # Cargar datos de prueba

# PWA
npm run generate-vapid   # Generar claves VAPID

# Tests
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch

# Linting
npm run lint             # Verificar código
npm run lint:fix         # Corregir automáticamente
```

## 📱 Configuración PWA

### 1. Generar Iconos

Los iconos PWA son esenciales. Ver instrucciones detalladas en `public/icons/README.md`.

```bash
# Opción recomendada: usar herramienta online
# https://www.pwabuilder.com/imageGenerator
# Subir logo → Descargar → Extraer en public/icons/
```

### 2. Configurar Service Worker

El Service Worker está preconfigurado en `public/service-worker.js` con:
- Cache de archivos estáticos al instalar
- Network-first para APIs
- Cache-first para imágenes
- Stale-while-revalidate para CSS/JS
- Soporte offline con página de fallback

### 3. Registrar Service Worker en tu Frontend

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#2196F3">
  <title>Sistema de Transporte</title>
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- Iconos -->
  <link rel="icon" href="/icons/favicon.ico">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
</head>
<body>
  <!-- Tu app aquí -->
  
  <!-- Registrar Service Worker y PWA Manager -->
  <script src="/pwa-manager.js"></script>
</body>
</html>
```

### 4. Solicitar Permisos de Notificaciones

```javascript
// En tu frontend
async function requestNotificationPermission() {
  const granted = await pwaManager.requestNotificationPermission();
  if (granted) {
    console.log('Notificaciones habilitadas');
  }
}

// Llamar después de que el usuario interactúe
document.getElementById('enable-notifications').addEventListener('click', requestNotificationPermission);
```

## 🔔 Push Notifications

### Enviar notificación desde el backend

```javascript
const { sendPushNotification } = require('./services/pushService');

await sendPushNotification(
  usuarioId,
  {
    title: 'Nuevo viaje disponible',
    body: 'Hay un viaje cerca de tu ubicación',
    icon: '/icons/icon-192x192.png',
    data: {
      url: '/trips/123',
      tripId: 123
    }
  }
);
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Usuarios
- `GET /api/users` - Listar usuarios (admin)
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `POST /api/vehicles` - Crear vehículo (conductor)
- `PUT /api/vehicles/:id/location` - Actualizar ubicación

### Rutas
- `GET /api/routes` - Listar rutas
- `POST /api/routes` - Crear ruta (admin)
- `GET /api/routes/nearby` - Rutas cercanas

### Viajes
- `GET /api/trips/available` - Viajes disponibles
- `POST /api/trips` - Crear viaje (conductor)
- `PUT /api/trips/:id/status` - Actualizar estado
- `PUT /api/trips/:id/location` - Actualizar ubicación

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `GET /api/notifications/vapid-public-key` - Obtener clave VAPID
- `POST /api/notifications/subscribe` - Suscribirse a push
- `PUT /api/notifications/:id/read` - Marcar como leída

### Sincronización
- `POST /api/sync` - Sincronizar datos offline

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm test -- auth.test.js

# Coverage
npm test -- --coverage
```

## 📚 Documentación Adicional

- **Arquitectura**: Ver `docs/ARCHITECTURE.md`
- **Iconos PWA**: Ver `public/icons/README.md`
- **API Reference**: Próximamente

## 🔐 Seguridad

- Autenticación JWT con refresh tokens
- Passwords hasheados con bcrypt (10 rounds)
- Rate limiting (100 requests/15min)
- Helmet para headers de seguridad
- CORS configurado
- Validación de datos con Joi
- SQL injection prevention con queries parametrizadas

## 🚀 Deployment

### Heroku

```bash
# Login
heroku login

# Crear app
heroku create tu-app-transporte

# Configurar addons
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev

# Configurar variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_secreto

# Deploy
git push heroku dev:master

# Ejecutar migraciones
heroku run npm run migrate
```

### Docker

```bash
# Build
docker build -t transporte-backend .

# Run
docker run -p 3000:3000 --env-file .env transporte-backend
```

## 👥 Usuarios de Prueba

Después de ejecutar `npm run seed`:

```
Admin:
- Email: admin@transporte.com
- Password: admin123

Conductor:
- Email: conductor1@transporte.com
- Password: conductor123

Pasajero:
- Email: pasajero1@transporte.com
- Password: pasajero123
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - Ver archivo `LICENSE` para más detalles

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/MrGys1986/transporte-backend/issues)
- **Email**: axelurielguzmansanchez@gmail.com
- **Documentación**: Ver carpeta `/docs`

---

Desarrollado con ❤️ para el Sistema de Transporte Urbano
