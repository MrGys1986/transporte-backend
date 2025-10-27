const { sendError } = require('../utils/response');

/**
 * Constantes de roles
 */
const ROLES = {
  ADMIN: 'admin',
  CONDUCTOR: 'conductor',
  PASAJERO: 'pasajero',
};

/**
 * Verificar si el usuario tiene un rol específico
 */
exports.hasRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Usuario no autenticado');
    }

    if (req.user.rol !== requiredRole) {
      return sendError(res, 403, `Se requiere rol de ${requiredRole}`);
    }

    next();
  };
};

/**
 * Verificar si el usuario tiene alguno de los roles especificados
 */
exports.hasAnyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Usuario no autenticado');
    }

    if (!roles.includes(req.user.rol)) {
      return sendError(res, 403, 'No tienes permisos para acceder a este recurso');
    }

    next();
  };
};

/**
 * Verificar si el usuario es administrador
 */
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, 'Usuario no autenticado');
  }

  if (req.user.rol !== ROLES.ADMIN) {
    return sendError(res, 403, 'Se requieren permisos de administrador');
  }

  next();
};

/**
 * Verificar si el usuario es conductor
 */
exports.isConductor = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, 'Usuario no autenticado');
  }

  if (req.user.rol !== ROLES.CONDUCTOR) {
    return sendError(res, 403, 'Se requiere ser conductor');
  }

  next();
};

/**
 * Verificar si el usuario es el propietario del recurso o admin
 */
exports.isOwnerOrAdmin = (idField = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Usuario no autenticado');
    }

    const resourceId = req.params[idField];
    const userId = req.user.id.toString();

    if (req.user.rol === ROLES.ADMIN || resourceId === userId) {
      return next();
    }

    return sendError(res, 403, 'No tienes permisos para acceder a este recurso');
  };
};

module.exports.ROLES = ROLES;
