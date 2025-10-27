/**
 * Validar email
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar teléfono (formato mexicano)
 */
exports.isValidPhone = (phone) => {
  const phoneRegex = /^(\+?52)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validar contraseña fuerte
 */
exports.isStrongPassword = (password) => {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validar coordenadas
 */
exports.isValidCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Validar URL
 */
exports.isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitizar string (remover caracteres especiales)
 */
exports.sanitizeString = (str) => {
  return str.replace(/[<>]/g, '');
};

/**
 * Validar número positivo
 */
exports.isPositiveNumber = (num) => {
  return !isNaN(num) && parseFloat(num) > 0;
};
