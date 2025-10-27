const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const { sendResponse, sendError } = require('../utils/response');
const { sendPushNotification } = require('../services/pushService');

/**
 * Obtener notificaciones del usuario
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const usuarioId = req.user.id;

    const result = await Notification.findByUsuario(usuarioId, parseInt(page), parseInt(limit));

    sendResponse(res, 200, result);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    sendError(res, 500, 'Error al obtener notificaciones', error.message);
  }
};

/**
 * Marcar notificación como leída
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.markAsRead(id);

    if (!notification) {
      return sendError(res, 404, 'Notificación no encontrada');
    }

    sendResponse(res, 200, {
      message: 'Notificación marcada como leída',
      notification,
    });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    sendError(res, 500, 'Error al marcar notificación', error.message);
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    await Notification.markAllAsRead(usuarioId);

    sendResponse(res, 200, {
      message: 'Todas las notificaciones marcadas como leídas',
    });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    sendError(res, 500, 'Error al marcar notificaciones', error.message);
  }
};

/**
 * Obtener contador de notificaciones no leídas
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const count = await Notification.countUnread(usuarioId);

    sendResponse(res, 200, { count });
  } catch (error) {
    console.error('Error al contar notificaciones:', error);
    sendError(res, 500, 'Error al contar notificaciones', error.message);
  }
};

/**
 * Suscribirse a notificaciones push
 */
exports.subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    const usuarioId = req.user.id;

    const subscription = await PushSubscription.createOrUpdate({
      usuario_id: usuarioId,
      endpoint,
      keys,
    });

    sendResponse(res, 201, {
      message: 'Suscripción creada exitosamente',
      subscription,
    });
  } catch (error) {
    console.error('Error al crear suscripción:', error);
    sendError(res, 500, 'Error al crear suscripción', error.message);
  }
};

/**
 * Desuscribirse de notificaciones push
 */
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    await PushSubscription.deleteByEndpoint(endpoint);

    sendResponse(res, 200, {
      message: 'Suscripción eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar suscripción:', error);
    sendError(res, 500, 'Error al eliminar suscripción', error.message);
  }
};

/**
 * Enviar notificación push de prueba
 */
exports.sendTestNotification = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    await sendPushNotification(usuarioId, {
      title: 'Notificación de prueba',
      body: 'Esta es una notificación de prueba del sistema de transporte',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
    });

    sendResponse(res, 200, {
      message: 'Notificación enviada exitosamente',
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    sendError(res, 500, 'Error al enviar notificación', error.message);
  }
};

/**
 * Eliminar notificación
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.delete(id);

    if (!notification) {
      return sendError(res, 404, 'Notificación no encontrada');
    }

    sendResponse(res, 200, {
      message: 'Notificación eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    sendError(res, 500, 'Error al eliminar notificación', error.message);
  }
};
