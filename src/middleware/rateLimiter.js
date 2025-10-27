const rateLimit = require('express-rate-limit');

/**
 * Rate limiter general
 */
exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas peticiones, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para autenticación
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login
  message: 'Demasiados intentos de inicio de sesión, intenta de nuevo más tarde',
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter estricto para rutas sensibles
 */
exports.strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 requests por hora
  message: 'Has excedido el límite de peticiones para esta operación',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para API pública
 */
exports.publicApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // máximo 30 requests por minuto
  message: 'Límite de API excedido',
  standardHeaders: true,
  legacyHeaders: false,
});
