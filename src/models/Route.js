const db = require('../config/database');

class Route {
  /**
   * Crear una nueva ruta
   */
  static async create(routeData) {
    const { 
      nombre, 
      origen, 
      destino, 
      distancia_km, 
      tiempo_estimado_min, 
      precio,
      puntos_intermedios = [] 
    } = routeData;
    
    const query = `
      INSERT INTO rutas (
        nombre, origen, destino, distancia_km, tiempo_estimado_min, 
        precio, puntos_intermedios, fecha_creacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    
    const values = [
      nombre, 
      origen, 
      destino, 
      distancia_km, 
      tiempo_estimado_min, 
      precio,
      JSON.stringify(puntos_intermedios)
    ];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }

  /**
   * Buscar ruta por ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM rutas WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Buscar rutas por origen y destino
   */
  static async findByOriginDestination(origen, destino) {
    const query = `
      SELECT * FROM rutas 
      WHERE origen ILIKE $1 AND destino ILIKE $2 AND activo = true
      ORDER BY precio ASC
    `;
    const result = await db.query(query, [`%${origen}%`, `%${destino}%`]);
    return result.rows;
  }

  /**
   * Actualizar ruta
   */
  static async update(id, routeData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(routeData).forEach((key) => {
      if (routeData[key] !== undefined && key !== 'id') {
        if (key === 'puntos_intermedios') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(routeData[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(routeData[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);
    const query = `
      UPDATE rutas 
      SET ${fields.join(', ')}, fecha_actualizacion = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar ruta (soft delete)
   */
  static async delete(id) {
    const query = 'UPDATE rutas SET activo = false WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Listar rutas
   */
  static async list(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM rutas 
      WHERE activo = true 
      ORDER BY nombre ASC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await db.query(query, [limit, offset]);
    
    const countQuery = 'SELECT COUNT(*) FROM rutas WHERE activo = true';
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
   * Buscar rutas cercanas a una ubicación
   */
  static async findNearby(lat, lng, radius = 5) {
    // Fórmula de Haversine simplificada para PostgreSQL
    const query = `
      SELECT *, 
        (6371 * acos(cos(radians($1)) * cos(radians(origen_lat)) * 
        cos(radians(origen_lng) - radians($2)) + 
        sin(radians($1)) * sin(radians(origen_lat)))) AS distancia
      FROM rutas
      WHERE activo = true
      HAVING distancia < $3
      ORDER BY distancia ASC
      LIMIT 10
    `;
    const result = await db.query(query, [lat, lng, radius]);
    return result.rows;
  }
}

module.exports = Route;
