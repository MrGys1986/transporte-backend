const { sendError } = require('../utils/response');

/**
 * Middleware global de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Error de validación
  if (err.name === 'ValidationError') {
    return sendError(res, 400, 'Error de validación', err.message);
  }

  // Error de base de datos
  if (err.code === '23505') {
    return sendError(res, 409, 'El recurso ya existe');
  }

  if (err.code === '23503') {
    return sendError(res, 400, 'Violación de clave foránea');
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Token inválido');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expirado');
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'JSON inválido');
  }

  // Error genérico
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  sendError(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

module.exports = errorHandler;
