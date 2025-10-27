const User = require('../models/User');
const { generateToken, verifyToken } = require('../config/jwt');
const bcrypt = require('bcryptjs');

/**
 * Autenticar usuario
 */
exports.authenticate = async (email, password) => {
  try {
    const user = await User.findByEmail(email);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.activo) {
      throw new Error('Usuario desactivado');
    }

    const isValidPassword = await User.comparePassword(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Contraseña incorrecta');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
    });

    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Registrar nuevo usuario
 */
exports.register = async (userData) => {
  try {
    const { nombre, email, password, telefono, rol } = userData;

    // Verificar si el email ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Crear usuario
    const user = await User.create({
      nombre,
      email,
      password,
      telefono,
      rol: rol || 'pasajero',
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
    });

    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Validar token
 */
exports.validateToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id);
    
    if (!user || !user.activo) {
      throw new Error('Usuario no válido');
    }

    return {
      id: user.id,
      email: user.email,
      rol: user.rol,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Refrescar token
 */
exports.refreshToken = async (oldToken) => {
  try {
    const decoded = verifyToken(oldToken);
    
    const user = await User.findById(decoded.id);
    
    if (!user || !user.activo) {
      throw new Error('Usuario no válido');
    }

    const newToken = generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
    });

    return newToken;
  } catch (error) {
    throw error;
  }
};

/**
 * Cambiar contraseña
 */
exports.changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValidPassword = await User.comparePassword(currentPassword, user.password);
    
    if (!isValidPassword) {
      throw new Error('Contraseña actual incorrecta');
    }

    await User.changePassword(userId, newPassword);

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Solicitar recuperación de contraseña
 */
exports.requestPasswordReset = async (email) => {
  try {
    const user = await User.findByEmail(email);
    
    if (!user) {
      // No revelar si el email existe o no
      return { message: 'Si el email existe, recibirás instrucciones' };
    }

    // Generar token de recuperación (temporal, 1 hora)
    const resetToken = generateToken(
      { id: user.id, type: 'password-reset' },
      '1h'
    );

    // Aquí enviarías un email con el token
    // await emailService.sendPasswordReset(user.email, resetToken);

    return { message: 'Instrucciones enviadas al email' };
  } catch (error) {
    throw error;
  }
};
