const db = require('../config/database');

class Notification {
  /**
   * Crear una nueva notificación
   */
  static async create(notificationData) {
    const { 
      usuario_id, 
      titulo, 
      mensaje, 
      tipo = 'info',
      data = {} 
    } = notificationData;
    
    const query = `
      INSERT INTO notificaciones (
        usuario_id, titulo, mensaje, tipo, data, fecha_creacion
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    
    const values = [usuario_id, titulo, mensaje, tipo, JSON.stringify(data)];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }

  /**
   * Buscar notificación por ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM notificaciones WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Buscar notificaciones por usuario
   */
  static async findByUsuario(usuarioId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM notificaciones 
      WHERE usuario_id = $1 
      ORDER BY fecha_creacion DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [usuarioId, limit, offset]);
    
    const countQuery = 'SELECT COUNT(*) FROM notificaciones WHERE usuario_id = $1';
    const countResult = await db.query(countQuery, [usuarioId]);
    
    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    };
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(id) {
    const query = `
      UPDATE notificaciones 
      SET leida = true, fecha_lectura = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead(usuarioId) {
    const query = `
      UPDATE notificaciones 
      SET leida = true, fecha_lectura = NOW()
      WHERE usuario_id = $1 AND leida = false
    `;
    await db.query(query, [usuarioId]);
    return true;
  }

  /**
   * Contar notificaciones no leídas
   */
  static async countUnread(usuarioId) {
    const query = 'SELECT COUNT(*) FROM notificaciones WHERE usuario_id = $1 AND leida = false';
    const result = await db.query(query, [usuarioId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Eliminar notificación
   */
  static async delete(id) {
    const query = 'DELETE FROM notificaciones WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Eliminar notificaciones antiguas
   */
  static async deleteOld(dias = 30) {
    const query = `
      DELETE FROM notificaciones 
      WHERE fecha_creacion < NOW() - INTERVAL '${dias} days'
      RETURNING COUNT(*) as eliminadas
    `;
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = Notification;
