const { sendError } = require('../utils/response');

/**
 * Middleware de validación genérico
 */
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return sendError(res, 400, 'Errores de validación', errors);
    }

    next();
  };
};

/**
 * Validar parámetros de query
 */
exports.validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return sendError(res, 400, 'Errores de validación en query', errors);
    }

    next();
  };
};

/**
 * Validar parámetros de ruta
 */
exports.validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return sendError(res, 400, 'Errores de validación en parámetros', errors);
    }

    next();
  };
};
