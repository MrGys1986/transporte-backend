const db = require('../config/database');

class PushSubscription {
  /**
   * Crear o actualizar una suscripción push
   */
  static async createOrUpdate(subscriptionData) {
    const { usuario_id, endpoint, keys } = subscriptionData;
    
    // Verificar si ya existe
    const existingQuery = 'SELECT id FROM push_subscriptions WHERE usuario_id = $1 AND endpoint = $2';
    const existing = await db.query(existingQuery, [usuario_id, endpoint]);
    
    if (existing.rows.length > 0) {
      // Actualizar
      const updateQuery = `
        UPDATE push_subscriptions 
        SET keys = $1, fecha_actualizacion = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const result = await db.query(updateQuery, [JSON.stringify(keys), existing.rows[0].id]);
      return result.rows[0];
    } else {
      // Crear nueva
      const insertQuery = `
        INSERT INTO push_subscriptions (usuario_id, endpoint, keys, fecha_creacion)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `;
      const result = await db.query(insertQuery, [usuario_id, endpoint, JSON.stringify(keys)]);
      return result.rows[0];
    }
  }

  /**
   * Buscar suscripciones por usuario
   */
  static async findByUsuario(usuarioId) {
    const query = 'SELECT * FROM push_subscriptions WHERE usuario_id = $1 AND activo = true';
    const result = await db.query(query, [usuarioId]);
    return result.rows;
  }

  /**
   * Buscar suscripción por endpoint
   */
  static async findByEndpoint(endpoint) {
    const query = 'SELECT * FROM push_subscriptions WHERE endpoint = $1';
    const result = await db.query(query, [endpoint]);
    return result.rows[0];
  }

  /**
   * Eliminar suscripción
   */
  static async delete(id) {
    const query = 'DELETE FROM push_subscriptions WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Eliminar por endpoint
   */
  static async deleteByEndpoint(endpoint) {
    const query = 'DELETE FROM push_subscriptions WHERE endpoint = $1 RETURNING id';
    const result = await db.query(query, [endpoint]);
    return result.rows[0];
  }

  /**
   * Desactivar suscripción (cuando falla el envío)
   */
  static async deactivate(id) {
    const query = 'UPDATE push_subscriptions SET activo = false WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Obtener todas las suscripciones activas
   */
  static async getAllActive() {
    const query = 'SELECT * FROM push_subscriptions WHERE activo = true';
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Limpiar suscripciones inactivas antiguas
   */
  static async cleanupInactive(dias = 7) {
    const query = `
      DELETE FROM push_subscriptions 
      WHERE activo = false 
      AND fecha_actualizacion < NOW() - INTERVAL '${dias} days'
      RETURNING COUNT(*) as eliminadas
    `;
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = PushSubscription;
