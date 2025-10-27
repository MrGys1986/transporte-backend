const db = require('../config/database');

class Vehicle {
  /**
   * Crear un nuevo vehículo
   */
  static async create(vehicleData) {
    const { 
      conductor_id, 
      marca, 
      modelo, 
      año, 
      placa, 
      color, 
      capacidad,
      tipo = 'automovil' 
    } = vehicleData;
    
    const query = `
      INSERT INTO vehiculos (
        conductor_id, marca, modelo, año, placa, color, capacidad, tipo, fecha_creacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;
    
    const values = [conductor_id, marca, modelo, año, placa, color, capacidad, tipo];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }

  /**
   * Buscar vehículo por ID
   */
  static async findById(id) {
    const query = `
      SELECT v.*, u.nombre as conductor_nombre, u.telefono as conductor_telefono
      FROM vehiculos v
      LEFT JOIN usuarios u ON v.conductor_id = u.id
      WHERE v.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Buscar vehículos por conductor
   */
  static async findByConductor(conductorId) {
    const query = 'SELECT * FROM vehiculos WHERE conductor_id = $1 AND activo = true';
    const result = await db.query(query, [conductorId]);
    return result.rows;
  }

  /**
   * Actualizar vehículo
   */
  static async update(id, vehicleData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(vehicleData).forEach((key) => {
      if (vehicleData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(vehicleData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);
    const query = `
      UPDATE vehiculos 
      SET ${fields.join(', ')}, fecha_actualizacion = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar vehículo (soft delete)
   */
  static async delete(id) {
    const query = 'UPDATE vehiculos SET activo = false WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Listar vehículos
   */
  static async list(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT v.*, u.nombre as conductor_nombre
      FROM vehiculos v
      LEFT JOIN usuarios u ON v.conductor_id = u.id
      WHERE v.activo = true
    `;
    const values = [];
    let paramCount = 1;

    if (filters.tipo) {
      query += ` AND v.tipo = $${paramCount}`;
      values.push(filters.tipo);
      paramCount++;
    }

    if (filters.conductor_id) {
      query += ` AND v.conductor_id = $${paramCount}`;
      values.push(filters.conductor_id);
      paramCount++;
    }

    query += ` ORDER BY v.fecha_creacion DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    
    const countQuery = 'SELECT COUNT(*) FROM vehiculos WHERE activo = true';
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
   * Actualizar ubicación del vehículo
   */
  static async updateLocation(id, lat, lng) {
    const query = `
      UPDATE vehiculos 
      SET ultima_latitud = $1, ultima_longitud = $2, ultima_ubicacion = NOW()
      WHERE id = $3
      RETURNING id, ultima_latitud, ultima_longitud, ultima_ubicacion
    `;
    const result = await db.query(query, [lat, lng, id]);
    return result.rows[0];
  }
}

module.exports = Vehicle;
