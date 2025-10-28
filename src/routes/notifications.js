const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/notifications/vapid-public-key
 * @desc    Obtener clave pública VAPID para push notifications
 * @access  Public
 */
router.get('/vapid-public-key', notificationController.getVapidPublicKey);

/**
 * @route   GET /api/notifications
 * @desc    Obtener notificaciones del usuario
 * @access  Private
 */
router.get('/', authenticate, notificationController.getUserNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obtener contador de notificaciones no leídas
 * @access  Private
 */
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar notificación como leída
 * @access  Private
 */
router.put('/:id/read', authenticate, notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Private
 */
router.put('/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @route   POST /api/notifications/subscribe
 * @desc    Suscribirse a notificaciones push
 * @access  Private
 */
router.post('/subscribe', authenticate, notificationController.subscribe);

/**
 * @route   POST /api/notifications/unsubscribe
 * @desc    Desuscribirse de notificaciones push
 * @access  Private
 */
router.post('/unsubscribe', authenticate, notificationController.unsubscribe);

/**
 * @route   POST /api/notifications/test
 * @desc    Enviar notificación de prueba
 * @access  Private
 */
router.post('/test', authenticate, notificationController.sendTestNotification);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Eliminar notificación
 * @access  Private
 */
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
