const { sendResponse, sendError } = require('../utils/response');
const { syncData, getLastSync } = require('../services/syncService');

/**
 * Sincronizar datos offline
 */
exports.syncOfflineData = async (req, res) => {
  try {
    const { data, timestamp } = req.body;
    const usuarioId = req.user.id;

    if (!data || !Array.isArray(data)) {
      return sendError(res, 400, 'Datos inválidos para sincronización');
    }

    const result = await syncData(usuarioId, data, timestamp);

    sendResponse(res, 200, {
      message: 'Datos sincronizados exitosamente',
      result,
    });
  } catch (error) {
    console.error('Error al sincronizar datos:', error);
    sendError(res, 500, 'Error al sincronizar datos', error.message);
  }
};

/**
 * Obtener cambios desde última sincronización
 */
exports.getChanges = async (req, res) => {
  try {
    const { since } = req.query;
    const usuarioId = req.user.id;

    if (!since) {
      return sendError(res, 400, 'Parámetro "since" es requerido');
    }

    const changes = await getLastSync(usuarioId, new Date(since));

    sendResponse(res, 200, {
      changes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al obtener cambios:', error);
    sendError(res, 500, 'Error al obtener cambios', error.message);
  }
};

/**
 * Obtener estado de sincronización
 */
exports.getSyncStatus = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // Aquí podrías implementar lógica para verificar el estado de sincronización
    const status = {
      user_id: usuarioId,
      last_sync: new Date().toISOString(),
      pending_items: 0,
      status: 'synchronized',
    };

    sendResponse(res, 200, status);
  } catch (error) {
    console.error('Error al obtener estado:', error);
    sendError(res, 500, 'Error al obtener estado de sincronización', error.message);
  }
};

/**
 * Limpiar datos sincronizados antiguos
 */
exports.cleanupOldData = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Implementar limpieza de datos antiguos
    const result = {
      message: `Datos anteriores a ${days} días eliminados`,
      deleted_count: 0,
    };

    sendResponse(res, 200, result);
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    sendError(res, 500, 'Error al limpiar datos', error.message);
  }
};
