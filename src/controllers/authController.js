const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { sendResponse, sendError } = require('../utils/response');

/**
 * Registro de usuario
 */
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, telefono, rol } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return sendError(res, 400, 'El email ya está registrado');
    }

    // Crear usuario
    const user = await User.create({ nombre, email, password, telefono, rol });

    // Generar token
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      rol: user.rol 
    });

    sendResponse(res, 201, {
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    sendError(res, 500, 'Error al registrar usuario', error.message);
  }
};

/**
 * Login de usuario
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return sendError(res, 401, 'Credenciales inválidas');
    }

    // Verificar que esté activo
    if (!user.activo) {
      return sendError(res, 403, 'Usuario desactivado');
    }

    // Verificar password
    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return sendError(res, 401, 'Credenciales inválidas');
    }

    // Generar token
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      rol: user.rol 
    });

    sendResponse(res, 200, {
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    sendError(res, 500, 'Error al iniciar sesión', error.message);
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return sendError(res, 404, 'Usuario no encontrado');
    }

    sendResponse(res, 200, { user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    sendError(res, 500, 'Error al obtener perfil', error.message);
  }
};

/**
 * Actualizar perfil del usuario autenticado
 */
exports.updateProfile = async (req, res) => {
  try {
    const { nombre, telefono } = req.body;
    
    const user = await User.update(req.user.id, { nombre, telefono });

    sendResponse(res, 200, {
      message: 'Perfil actualizado exitosamente',
      user,
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    sendError(res, 500, 'Error al actualizar perfil', error.message);
  }
};

/**
 * Cambiar contraseña
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario
    const user = await User.findByEmail(req.user.email);
    
    // Verificar contraseña actual
    const isValidPassword = await User.comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return sendError(res, 401, 'Contraseña actual incorrecta');
    }

    // Cambiar contraseña
    await User.changePassword(req.user.id, newPassword);

    sendResponse(res, 200, {
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    sendError(res, 500, 'Error al cambiar contraseña', error.message);
  }
};

/**
 * Logout (invalidar token en el cliente)
 */
exports.logout = async (req, res) => {
  try {
    // El logout se maneja en el cliente eliminando el token
    // Aquí se podría agregar lógica adicional como blacklist de tokens
    sendResponse(res, 200, {
      message: 'Logout exitoso',
    });
  } catch (error) {
    console.error('Error en logout:', error);
    sendError(res, 500, 'Error al cerrar sesión', error.message);
  }
};
