const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

/**
 * Encriptar texto
 */
exports.encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Desencriptar texto
 */
exports.decrypt = (text) => {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * Generar hash
 */
exports.hash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Generar token aleatorio
 */
exports.generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
