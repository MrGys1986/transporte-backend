const db = require('../config/database');

class Trip {
  /**
   * Crear un nuevo viaje
   */
  static async create(tripData) {
    const { 
      ruta_id, 
      vehiculo_id, 
      conductor_id,
      pasajero_id,
      origen,
      destino,
      fecha_salida,
      precio,
      estado = 'pendiente'
    } = tripData;
    
    const query = `
      INSERT INTO viajes (
        ruta_id, vehiculo_id, conductor_id, pasajero_id, origen, destino,
        fecha_salida, precio, estado, fecha_creacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;
    
    const values = [
      ruta_id, vehiculo_id, conductor_id, pasajero_id, 
      origen, destino, fecha_salida, precio, estado
    ];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }

  /**
   * Buscar viaje por ID
   */
  static async findById(id) {
    const query = `
      SELECT v.*, 
        r.nombre as ruta_nombre,
        vh.marca as vehiculo_marca, vh.modelo as vehiculo_modelo, vh.placa as vehiculo_placa,
        c.nombre as conductor_nombre, c.telefono as conductor_telefono,
        p.nombre as pasajero_nombre, p.telefono as pasajero_telefono
      FROM viajes v
      LEFT JOIN rutas r ON v.ruta_id = r.id
      LEFT JOIN vehiculos vh ON v.vehiculo_id = vh.id
      LEFT JOIN usuarios c ON v.conductor_id = c.id
      LEFT JOIN usuarios p ON v.pasajero_id = p.id
      WHERE v.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Buscar viajes por conductor
   */
  static async findByConductor(conductorId, estado = null) {
    let query = `
      SELECT v.*, r.nombre as ruta_nombre, p.nombre as pasajero_nombre
      FROM viajes v
      LEFT JOIN rutas r ON v.ruta_id = r.id
      LEFT JOIN usuarios p ON v.pasajero_id = p.id
      WHERE v.conductor_id = $1
    `;
    const values = [conductorId];
    
    if (estado) {
      query += ' AND v.estado = $2';
      values.push(estado);
    }
    
    query += ' ORDER BY v.fecha_salida DESC';
    
    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Buscar viajes por pasajero
   */
  static async findByPasajero(pasajeroId, estado = null) {
    let query = `
      SELECT v.*, r.nombre as ruta_nombre, c.nombre as conductor_nombre
      FROM viajes v
      LEFT JOIN rutas r ON v.ruta_id = r.id
      LEFT JOIN usuarios c ON v.conductor_id = c.id
      WHERE v.pasajero_id = $1
    `;
    const values = [pasajeroId];
    
    if (estado) {
      query += ' AND v.estado = $2';
      values.push(estado);
    }
    
    query += ' ORDER BY v.fecha_salida DESC';
    
    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Actualizar estado del viaje
   */
  static async updateEstado(id, estado) {
    const query = `
      UPDATE viajes 
      SET estado = $1, fecha_actualizacion = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [estado, id]);
    return result.rows[0];
  }

  /**
   * Actualizar viaje
   */
  static async update(id, tripData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(tripData).forEach((key) => {
      if (tripData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(tripData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);
    const query = `
      UPDATE viajes 
      SET ${fields.join(', ')}, fecha_actualizacion = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Cancelar viaje
   */
  static async cancel(id, motivo = '') {
    const query = `
      UPDATE viajes 
      SET estado = 'cancelado', motivo_cancelacion = $1, fecha_actualizacion = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [motivo, id]);
    return result.rows[0];
  }

  /**
   * Listar viajes disponibles
   */
  static async listDisponibles(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT v.*, r.nombre as ruta_nombre, c.nombre as conductor_nombre
      FROM viajes v
      LEFT JOIN rutas r ON v.ruta_id = r.id
      LEFT JOIN usuarios c ON v.conductor_id = c.id
      WHERE v.estado = 'disponible' AND v.fecha_salida > NOW()
      ORDER BY v.fecha_salida ASC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await db.query(query, [limit, offset]);
    
    const countQuery = "SELECT COUNT(*) FROM viajes WHERE estado = 'disponible' AND fecha_salida > NOW()";
    const countResult = await db.query(countQuery);
    
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
   * Actualizar ubicación en tiempo real
   */
  static async updateUbicacionActual(id, lat, lng) {
    const query = `
      UPDATE viajes 
      SET ubicacion_actual_lat = $1, ubicacion_actual_lng = $2, 
          fecha_ultima_ubicacion = NOW()
      WHERE id = $3
      RETURNING id, ubicacion_actual_lat, ubicacion_actual_lng, fecha_ultima_ubicacion
    `;
    const result = await db.query(query, [lat, lng, id]);
    return result.rows[0];
  }
}

module.exports = Trip;
