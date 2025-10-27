/**
 * Formatear fecha a string legible
 */
exports.formatDate = (date, locale = 'es-MX') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formatear fecha y hora
 */
exports.formatDateTime = (date, locale = 'es-MX') => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Obtener diferencia en días
 */
exports.getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

/**
 * Verificar si una fecha es pasada
 */
exports.isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Verificar si una fecha es futura
 */
exports.isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Agregar días a una fecha
 */
exports.addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Obtener inicio del día
 */
exports.startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Obtener fin del día
 */
exports.endOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};
