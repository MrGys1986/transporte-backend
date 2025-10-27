/**
 * Roles de usuario
 */
exports.ROLES = {
  ADMIN: 'admin',
  CONDUCTOR: 'conductor',
  PASAJERO: 'pasajero',
};

/**
 * Estados de viaje
 */
exports.TRIP_STATUS = {
  PENDIENTE: 'pendiente',
  CONFIRMADO: 'confirmado',
  EN_CURSO: 'en_curso',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
};

/**
 * Tipos de vehículo
 */
exports.VEHICLE_TYPES = {
  AUTOMOVIL: 'automovil',
  CAMIONETA: 'camioneta',
  AUTOBUS: 'autobus',
  VAN: 'van',
};

/**
 * Tipos de notificación
 */
exports.NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
  TRIP_UPDATE: 'trip_update',
  PAYMENT: 'payment',
};

/**
 * Códigos de error
 */
exports.ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE: 'DUPLICATE',
  SERVER_ERROR: 'SERVER_ERROR',
};

/**
 * Límites de paginación
 */
exports.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

/**
 * Duraciones de caché (en segundos)
 */
exports.CACHE_TTL = {
  SHORT: 60, // 1 minuto
  MEDIUM: 300, // 5 minutos
  LONG: 3600, // 1 hora
  VERY_LONG: 86400, // 24 horas
};
