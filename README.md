# Backend PWA - Sistema de Transporte

Backend para Progressive Web Application del sistema de transporte.

## Estructura del Proyecto

Ver `docs/ARCHITECTURE.md` para información detallada sobre la arquitectura.

## Instalación

```bash
npm install
```

## Configuración

1. Copiar `.env.example` a `.env`
2. Configurar las variables de entorno
3. Ejecutar migraciones: `npm run migrate`

## Uso

```bash
# Desarrollo
npm run dev

# Producción
npm start

# Tests
npm test
```

## Características PWA

- API REST completa
- Autenticación JWT
- Notificaciones Push
- Sincronización offline
- Caché con Redis
- Geolocalización en tiempo real
