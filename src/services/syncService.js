const db = require('../config/database');

/**
 * Sincronizar datos offline del cliente
 */
exports.syncData = async (usuarioId, data, clientTimestamp) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    const results = {
      synchronized: 0,
      conflicts: 0,
      errors: 0,
    };

    for (const item of data) {
      try {
        const { type, action, id, payload, timestamp } = item;

        // Verificar conflictos
        const conflict = await this.checkConflict(client, type, id, timestamp);
        
        if (conflict) {
          results.conflicts++;
          continue;
        }

        // Aplicar cambios según el tipo y acción
        switch (action) {
          case 'create':
            await this.handleCreate(client, type, payload, usuarioId);
            break;
          case 'update':
            await this.handleUpdate(client, type, id, payload);
            break;
          case 'delete':
            await this.handleDelete(client, type, id);
            break;
        }

        results.synchronized++;
      } catch (error) {
        console.error('Error al sincronizar item:', error);
        results.errors++;
      }
    }

    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Obtener cambios desde última sincronización
 */
exports.getLastSync = async (usuarioId, sinceDate) => {
  try {
    const changes = {
      viajes: [],
      notificaciones: [],
      rutas: [],
    };

    // Obtener viajes actualizados
    const viajesQuery = `
      SELECT * FROM viajes 
      WHERE (conductor_id = $1 OR pasajero_id = $1) 
      AND fecha_actualizacion > $2
    `;
    const viajes = await db.query(viajesQuery, [usuarioId, sinceDate]);
    changes.viajes = viajes.rows;

    // Obtener notificaciones nuevas
    const notifQuery = `
      SELECT * FROM notificaciones 
      WHERE usuario_id = $1 AND fecha_creacion > $2
    `;
    const notif = await db.query(notifQuery, [usuarioId, sinceDate]);
    changes.notificaciones = notif.rows;

    // Obtener rutas actualizadas
    const rutasQuery = `
      SELECT * FROM rutas 
      WHERE activo = true AND fecha_actualizacion > $1
    `;
    const rutas = await db.query(rutasQuery, [sinceDate]);
    changes.rutas = rutas.rows;

    return changes;
  } catch (error) {
    throw error;
  }
};

/**
 * Verificar conflictos de sincronización
 */
exports.checkConflict = async (client, type, id, clientTimestamp) => {
  if (!id) return false;

  const table = this.getTableName(type);
  const query = `
    SELECT fecha_actualizacion 
    FROM ${table} 
    WHERE id = $1
  `;
  
  const result = await client.query(query, [id]);
  
  if (result.rows.length === 0) return false;

  const serverTimestamp = new Date(result.rows[0].fecha_actualizacion);
  const clientTime = new Date(clientTimestamp);

  return serverTimestamp > clientTime;
};

/**
 * Manejar creación de registros
 */
exports.handleCreate = async (client, type, payload, usuarioId) => {
  // Implementar lógica según el tipo
  // Ejemplo básico:
  const table = this.getTableName(type);
  const keys = Object.keys(payload);
  const values = Object.values(payload);
  
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING id
  `;
  
  return await client.query(query, values);
};

/**
 * Manejar actualización de registros
 */
exports.handleUpdate = async (client, type, id, payload) => {
  const table = this.getTableName(type);
  const keys = Object.keys(payload);
  const values = Object.values(payload);
  
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const query = `
    UPDATE ${table} 
    SET ${setClause}, fecha_actualizacion = NOW()
    WHERE id = $${keys.length + 1}
  `;
  
  return await client.query(query, [...values, id]);
};

/**
 * Manejar eliminación de registros
 */
exports.handleDelete = async (client, type, id) => {
  const table = this.getTableName(type);
  const query = `UPDATE ${table} SET activo = false WHERE id = $1`;
  return await client.query(query, [id]);
};

/**
 * Obtener nombre de tabla según tipo
 */
exports.getTableName = (type) => {
  const mapping = {
    trip: 'viajes',
    vehicle: 'vehiculos',
    route: 'rutas',
    notification: 'notificaciones',
  };
  return mapping[type] || type;
};
