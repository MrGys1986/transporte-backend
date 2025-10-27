const redisClient = require('../config/redis');

/**
 * Guardar en caché
 */
exports.set = async (key, value, ttl = 3600) => {
  try {
    const serialized = JSON.stringify(value);
    await redisClient.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.error('Error al guardar en caché:', error);
    return false;
  }
};

/**
 * Obtener de caché
 */
exports.get = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al obtener de caché:', error);
    return null;
  }
};

/**
 * Eliminar de caché
 */
exports.del = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Error al eliminar de caché:', error);
    return false;
  }
};

/**
 * Eliminar múltiples claves
 */
exports.delPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return keys.length;
  } catch (error) {
    console.error('Error al eliminar patrón:', error);
    return 0;
  }
};

/**
 * Verificar si existe una clave
 */
exports.exists = async (key) => {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Error al verificar existencia:', error);
    return false;
  }
};

/**
 * Obtener tiempo de vida restante
 */
exports.ttl = async (key) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error('Error al obtener TTL:', error);
    return -1;
  }
};

/**
 * Limpiar toda la caché
 */
exports.flush = async () => {
  try {
    await redisClient.flushall();
    return true;
  } catch (error) {
    console.error('Error al limpiar caché:', error);
    return false;
  }
};
