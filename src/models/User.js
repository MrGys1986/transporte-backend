const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Crear un nuevo usuario
   */
  static async create(userData) {
    const { nombre, email, password, telefono, rol = 'pasajero' } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO usuarios (nombre, email, password, telefono, rol, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, nombre, email, telefono, rol, fecha_creacion
    `;
    
    const values = [nombre, email, hashedPassword, telefono, rol];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }

  /**
   * Buscar usuario por ID
   */
  static async findById(id) {
    const query = 'SELECT id, nombre, email, telefono, rol, activo, fecha_creacion FROM usuarios WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Buscar usuario por email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  /**
   * Actualizar usuario
   */
  static async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(userData).forEach((key) => {
      if (userData[key] !== undefined && key !== 'password' && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(userData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);
    const query = `
      UPDATE usuarios 
      SET ${fields.join(', ')}, fecha_actualizacion = NOW()
      WHERE id = $${paramCount}
      RETURNING id, nombre, email, telefono, rol, activo
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar usuario (soft delete)
   */
  static async delete(id) {
    const query = 'UPDATE usuarios SET activo = false WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Listar usuarios con paginación
   */
  static async list(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let query = 'SELECT id, nombre, email, telefono, rol, activo, fecha_creacion FROM usuarios WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.rol) {
      query += ` AND rol = $${paramCount}`;
      values.push(filters.rol);
      paramCount++;
    }

    if (filters.activo !== undefined) {
      query += ` AND activo = $${paramCount}`;
      values.push(filters.activo);
      paramCount++;
    }

    query += ` ORDER BY fecha_creacion DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    
    const countQuery = 'SELECT COUNT(*) FROM usuarios WHERE 1=1';
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
   * Verificar password
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Cambiar password
   */
  static async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE usuarios SET password = $1, fecha_actualizacion = NOW() WHERE id = $2';
    await db.query(query, [hashedPassword, id]);
    return true;
  }
}

module.exports = User;
