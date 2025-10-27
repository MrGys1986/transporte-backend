const cacheService = require('../services/cacheService');

/**
 * Middleware de caché para respuestas
 */
exports.cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Solo cachear peticiones GET
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await cacheService.get(key);

      if (cachedResponse) {
        return res.status(200).json(cachedResponse);
      }

      // Guardar la función original json
      const originalJson = res.json.bind(res);

      // Sobrescribir res.json para guardar en caché
      res.json = (body) => {
        cacheService.set(key, body, duration);
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Error en middleware de caché:', error);
      next();
    }
  };
};

/**
 * Invalidar caché por patrón
 */
exports.invalidateCache = async (pattern) => {
  try {
    await cacheService.delPattern(pattern);
  } catch (error) {
    console.error('Error al invalidar caché:', error);
  }
};
