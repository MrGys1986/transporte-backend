const Route = require('../models/Route');
const { sendResponse, sendError } = require('../utils/response');

/**
 * Obtener todas las rutas
 */
exports.getAllRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await Route.list(parseInt(page), parseInt(limit));

    sendResponse(res, 200, result);
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    sendError(res, 500, 'Error al obtener rutas', error.message);
  }
};

/**
 * Obtener ruta por ID
 */
exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findById(id);

    if (!route) {
      return sendError(res, 404, 'Ruta no encontrada');
    }

    sendResponse(res, 200, { route });
  } catch (error) {
    console.error('Error al obtener ruta:', error);
    sendError(res, 500, 'Error al obtener ruta', error.message);
  }
};

/**
 * Buscar rutas por origen y destino
 */
exports.searchRoutes = async (req, res) => {
  try {
    const { origen, destino } = req.query;

    if (!origen || !destino) {
      return sendError(res, 400, 'Origen y destino son requeridos');
    }

    const routes = await Route.findByOriginDestination(origen, destino);

    sendResponse(res, 200, { routes });
  } catch (error) {
    console.error('Error al buscar rutas:', error);
    sendError(res, 500, 'Error al buscar rutas', error.message);
  }
};

/**
 * Buscar rutas cercanas
 */
exports.getNearbyRoutes = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return sendError(res, 400, 'Latitud y longitud son requeridas');
    }

    const routes = await Route.findNearby(
      parseFloat(lat), 
      parseFloat(lng), 
      parseFloat(radius)
    );

    sendResponse(res, 200, { routes });
  } catch (error) {
    console.error('Error al buscar rutas cercanas:', error);
    sendError(res, 500, 'Error al buscar rutas cercanas', error.message);
  }
};

/**
 * Crear nueva ruta
 */
exports.createRoute = async (req, res) => {
  try {
    const routeData = req.body;

    const route = await Route.create(routeData);

    sendResponse(res, 201, {
      message: 'Ruta creada exitosamente',
      route,
    });
  } catch (error) {
    console.error('Error al crear ruta:', error);
    sendError(res, 500, 'Error al crear ruta', error.message);
  }
};

/**
 * Actualizar ruta
 */
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const routeData = req.body;

    const route = await Route.update(id, routeData);

    if (!route) {
      return sendError(res, 404, 'Ruta no encontrada');
    }

    sendResponse(res, 200, {
      message: 'Ruta actualizada exitosamente',
      route,
    });
  } catch (error) {
    console.error('Error al actualizar ruta:', error);
    sendError(res, 500, 'Error al actualizar ruta', error.message);
  }
};

/**
 * Eliminar ruta
 */
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await Route.delete(id);

    if (!route) {
      return sendError(res, 404, 'Ruta no encontrada');
    }

    sendResponse(res, 200, {
      message: 'Ruta eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar ruta:', error);
    sendError(res, 500, 'Error al eliminar ruta', error.message);
  }
};
