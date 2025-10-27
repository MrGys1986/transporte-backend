const app = require('./app');
const config = require('./config');
const db = require('./config/database');
const redisClient = require('./config/redis');

const PORT = config.port;

// Verificar conexión a base de datos
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1);
  } else {
    console.log('✅ Base de datos conectada:', res.rows[0].now);
  }
});

// Conectar a Redis (opcional)
redisClient.ping((err, reply) => {
  if (err) {
    console.warn('⚠️  Redis no disponible:', err.message);
  } else {
    console.log('✅ Redis conectado:', reply);
  }
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`
  🚀 Servidor iniciado
  📍 Puerto: ${PORT}
  🌍 Entorno: ${config.nodeEnv}
  📅 ${new Date().toLocaleString('es-MX')}
  `);
});

// Manejo de cierre graceful
const gracefulShutdown = () => {
  console.log('\n⏳ Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    db.end(() => {
      console.log('✅ Conexión a base de datos cerrada');
      redisClient.quit(() => {
        console.log('✅ Conexión a Redis cerrada');
        process.exit(0);
      });
    });
  });
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error('❌ Forzando cierre...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;
