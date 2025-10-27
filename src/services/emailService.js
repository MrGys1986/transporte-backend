const nodemailer = require('nodemailer');
const config = require('../config');

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Enviar email genérico
 */
exports.sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: `"Sistema de Transporte" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    return false;
  }
};

/**
 * Enviar email de bienvenida
 */
exports.sendWelcomeEmail = async (userEmail, userName) => {
  const subject = '¡Bienvenido al Sistema de Transporte!';
  const html = `
    <h1>¡Hola ${userName}!</h1>
    <p>Gracias por registrarte en nuestro sistema de transporte.</p>
    <p>Ahora puedes comenzar a utilizar todos nuestros servicios.</p>
    <p>¡Que tengas un excelente viaje!</p>
  `;

  return await this.sendEmail(userEmail, subject, html);
};

/**
 * Enviar notificación de viaje
 */
exports.sendTripNotification = async (userEmail, tripDetails) => {
  const subject = 'Actualización de tu viaje';
  const html = `
    <h2>Información de tu viaje</h2>
    <p><strong>Origen:</strong> ${tripDetails.origen}</p>
    <p><strong>Destino:</strong> ${tripDetails.destino}</p>
    <p><strong>Fecha:</strong> ${tripDetails.fecha}</p>
    <p><strong>Estado:</strong> ${tripDetails.estado}</p>
  `;

  return await this.sendEmail(userEmail, subject, html);
};
