const User = require('../models/User');
const { sendResponse, sendError } = require('../utils/response');

/**
 * Obtener todos los usuarios
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, rol, activo } = req.query;
    
    const filters = {};
    if (rol) filters.rol = rol;
    if (activo !== undefined) filters.activo = activo === 'true';

    const result = await User.list(parseInt(page), parseInt(limit), filters);

    sendResponse(res, 200, result);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    sendError(res, 500, 'Error al obtener usuarios', error.message);
  }
};

/**
 * Obtener usuario por ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, 'Usuario no encontrado');
    }

    sendResponse(res, 200, { user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    sendError(res, 500, 'Error al obtener usuario', error.message);
  }
};

/**
 * Crear nuevo usuario (admin)
 */
exports.createUser = async (req, res) => {
  try {
    const { nombre, email, password, telefono, rol } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return sendError(res, 400, 'El email ya está registrado');
    }

    const user = await User.create({ nombre, email, password, telefono, rol });

    sendResponse(res, 201, {
      message: 'Usuario creado exitosamente',
      user,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    sendError(res, 500, 'Error al crear usuario', error.message);
  }
};

/**
 * Actualizar usuario
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, rol, activo } = req.body;

    const user = await User.update(id, { nombre, telefono, rol, activo });

    if (!user) {
      return sendError(res, 404, 'Usuario no encontrado');
    }

    sendResponse(res, 200, {
      message: 'Usuario actualizado exitosamente',
      user,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    sendError(res, 500, 'Error al actualizar usuario', error.message);
  }
};

/**
 * Eliminar usuario (soft delete)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.delete(id);

    if (!user) {
      return sendError(res, 404, 'Usuario no encontrado');
    }

    sendResponse(res, 200, {
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    sendError(res, 500, 'Error al eliminar usuario', error.message);
  }
};
