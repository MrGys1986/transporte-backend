const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/sync/offline
 * @desc    Sincronizar datos offline
 * @access  Private
 */
router.post('/offline', authenticate, syncController.syncOfflineData);

/**
 * @route   GET /api/sync/changes
 * @desc    Obtener cambios desde última sincronización
 * @access  Private
 */
router.get('/changes', authenticate, syncController.getChanges);

/**
 * @route   GET /api/sync/status
 * @desc    Obtener estado de sincronización
 * @access  Private
 */
router.get('/status', authenticate, syncController.getSyncStatus);

/**
 * @route   DELETE /api/sync/cleanup
 * @desc    Limpiar datos sincronizados antiguos
 * @access  Private
 */
router.delete('/cleanup', authenticate, syncController.cleanupOldData);

module.exports = router;
