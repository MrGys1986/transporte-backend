const twilio = require('twilio');
const config = require('../config');

// Inicializar cliente de Twilio
let twilioClient = null;

if (config.twilio.accountSid && config.twilio.authToken) {
  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
} else {
  console.warn('⚠️  Twilio no configurado. SMS deshabilitados.');
}

/**
 * Enviar SMS
 */
exports.sendSMS = async (to, message) => {
  if (!twilioClient) {
    console.warn('SMS no enviado: Twilio no configurado');
    return false;
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log('SMS enviado:', result.sid);
    return true;
  } catch (error) {
    console.error('Error al enviar SMS:', error);
    return false;
  }
};

/**
 * Enviar código de verificación
 */
exports.sendVerificationCode = async (phoneNumber, code) => {
  const message = `Tu código de verificación es: ${code}. No lo compartas con nadie.`;
  return await this.sendSMS(phoneNumber, message);
};

/**
 * Enviar notificación de viaje por SMS
 */
exports.sendTripNotification = async (phoneNumber, tripInfo) => {
  const message = `Tu viaje de ${tripInfo.origen} a ${tripInfo.destino} está ${tripInfo.estado}.`;
  return await this.sendSMS(phoneNumber, message);
};
