const redis = require('redis');
const config = require('./index');

const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('El servidor Redis rechazó la conexión');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Tiempo de reintento agotado');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

redisClient.on('connect', () => {
  console.log('✅ Conectado a Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Error en Redis:', err);
});

module.exports = redisClient;
