const webpush = require('web-push');

console.log('🔑 Generando claves VAPID para notificaciones push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Claves VAPID generadas:\n');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);
console.log('\n📝 Agrega estas claves a tu archivo .env:');
console.log(`\nVAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('\n✨ ¡Listo! Ahora puedes usar notificaciones push en tu PWA.\n');
