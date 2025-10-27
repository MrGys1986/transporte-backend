const webpush = require('web-push');
const config = require('./index');

// Configurar VAPID keys para notificaciones push
if (config.vapid.publicKey && config.vapid.privateKey) {
  webpush.setVapidDetails(
    config.vapid.subject,
    config.vapid.publicKey,
    config.vapid.privateKey
  );
  console.log('✅ VAPID configurado para notificaciones push');
} else {
  console.warn('⚠️  VAPID keys no configuradas. Ejecuta: npm run generate-vapid');
}

module.exports = webpush;
