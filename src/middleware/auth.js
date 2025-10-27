const { verifyToken } = require('../config/jwt');
const { sendError } = require('../utils/response');

/**
 * Middleware de autenticación JWT
 */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Token no proporcionado');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return sendError(res, 401, 'Token inválido o expirado');
    }
  } catch (error) {
    return sendError(res, 500, 'Error en autenticación', error.message);
  }
};

/**
 * Middleware para verificar roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'No autenticado');
    }

    if (!roles.includes(req.user.rol)) {
      return sendError(res, 403, 'No tienes permisos para realizar esta acción');
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
      } catch (error) {
        // Si el token es inválido, continuar sin usuario
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
