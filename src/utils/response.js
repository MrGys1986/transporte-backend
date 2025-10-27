/**
 * Enviar respuesta exitosa
 */
exports.sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Enviar respuesta de error
 */
exports.sendError = (res, statusCode, message, details = null) => {
  const response = {
    success: false,
    message,
  };

  if (details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
};

/**
 * Enviar respuesta con paginación
 */
exports.sendPaginatedResponse = (res, data, pagination) => {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages,
    },
  });
};
