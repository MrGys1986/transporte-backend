const webpush = require('../config/vapid');
const PushSubscription = require('../models/PushSubscription');
const Notification = require('../models/Notification');

/**
 * Enviar notificación push a un usuario
 */
exports.sendPushNotification = async (usuarioId, payload) => {
  try {
    const { title, body, icon, badge, data = {} } = payload;

    // Obtener todas las suscripciones del usuario
    const subscriptions = await PushSubscription.findByUsuario(usuarioId);

    if (subscriptions.length === 0) {
      console.log(`Usuario ${usuarioId} no tiene suscripciones push`);
      return { sent: 0, failed: 0 };
    }

    // Crear notificación en la base de datos
    await Notification.create({
      usuario_id: usuarioId,
      titulo: title,
      mensaje: body,
      tipo: data.tipo || 'info',
      data,
    });

    // Preparar payload de notificación
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/badge-72x72.png',
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });

    // Enviar a todas las suscripciones
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys,
          };

          await webpush.sendNotification(pushSubscription, notificationPayload);
          return { success: true, subId: sub.id };
        } catch (error) {
          console.error(`Error al enviar push a suscripción ${sub.id}:`, error);
          
          // Si el endpoint ya no es válido, desactivar suscripción
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.deactivate(sub.id);
          }
          
          return { success: false, subId: sub.id, error: error.message };
        }
      })
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - sent;

    return { sent, failed, total: results.length };
  } catch (error) {
    console.error('Error en sendPushNotification:', error);
    throw error;
  }
};

/**
 * Enviar notificación a múltiples usuarios
 */
exports.sendBulkNotifications = async (usuarioIds, payload) => {
  try {
    const results = await Promise.allSettled(
      usuarioIds.map((usuarioId) => this.sendPushNotification(usuarioId, payload))
    );

    const summary = results.reduce(
      (acc, result) => {
        if (result.status === 'fulfilled') {
          acc.sent += result.value.sent;
          acc.failed += result.value.failed;
          acc.total += result.value.total;
        } else {
          acc.errors.push(result.reason);
        }
        return acc;
      },
      { sent: 0, failed: 0, total: 0, errors: [] }
    );

    return summary;
  } catch (error) {
    console.error('Error en sendBulkNotifications:', error);
    throw error;
  }
};

/**
 * Enviar notificación a todos los usuarios
 */
exports.sendBroadcast = async (payload) => {
  try {
    const subscriptions = await PushSubscription.getAllActive();

    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0, total: 0 };
    }

    // Agrupar por usuario para evitar duplicados
    const uniqueUsers = [...new Set(subscriptions.map((sub) => sub.usuario_id))];

    return await this.sendBulkNotifications(uniqueUsers, payload);
  } catch (error) {
    console.error('Error en sendBroadcast:', error);
    throw error;
  }
};

/**
 * Programar notificación (implementación simple)
 */
exports.scheduleNotification = async (usuarioId, payload, sendAt) => {
  try {
    const now = new Date();
    const scheduledTime = new Date(sendAt);
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      throw new Error('La fecha programada debe ser futura');
    }

    // En producción, usar un sistema de colas como Bull o Agenda
    setTimeout(async () => {
      await this.sendPushNotification(usuarioId, payload);
    }, delay);

    return {
      message: 'Notificación programada',
      sendAt: scheduledTime.toISOString(),
    };
  } catch (error) {
    console.error('Error en scheduleNotification:', error);
    throw error;
  }
};
