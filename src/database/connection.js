const db = require('../config/database');

/**
 * Verificar conexión a la base de datos
 */
exports.checkConnection = async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ Conexión a base de datos verificada:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    return false;
  }
};

/**
 * Cerrar conexión
 */
exports.closeConnection = async () => {
  try {
    await db.end();
    console.log('✅ Conexión a base de datos cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error);
  }
};

module.exports = db;
