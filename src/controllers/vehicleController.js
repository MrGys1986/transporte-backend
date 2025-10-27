const Vehicle = require('../models/Vehicle');
const { sendResponse, sendError } = require('../utils/response');

/**
 * Obtener todos los vehículos
 */
exports.getAllVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, tipo, conductor_id } = req.query;
    
    const filters = {};
    if (tipo) filters.tipo = tipo;
    if (conductor_id) filters.conductor_id = conductor_id;

    const result = await Vehicle.list(parseInt(page), parseInt(limit), filters);

    sendResponse(res, 200, result);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    sendError(res, 500, 'Error al obtener vehículos', error.message);
  }
};

/**
 * Obtener vehículo por ID
 */
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return sendError(res, 404, 'Vehículo no encontrado');
    }

    sendResponse(res, 200, { vehicle });
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    sendError(res, 500, 'Error al obtener vehículo', error.message);
  }
};

/**
 * Obtener vehículos por conductor
 */
exports.getVehiclesByConductor = async (req, res) => {
  try {
    const { conductorId } = req.params;
    const vehicles = await Vehicle.findByConductor(conductorId);

    sendResponse(res, 200, { vehicles });
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    sendError(res, 500, 'Error al obtener vehículos', error.message);
  }
};

/**
 * Crear nuevo vehículo
 */
exports.createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // Si no se proporciona conductor_id, usar el usuario autenticado
    if (!vehicleData.conductor_id && req.user.rol === 'conductor') {
      vehicleData.conductor_id = req.user.id;
    }

    const vehicle = await Vehicle.create(vehicleData);

    sendResponse(res, 201, {
      message: 'Vehículo creado exitosamente',
      vehicle,
    });
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    sendError(res, 500, 'Error al crear vehículo', error.message);
  }
};

/**
 * Actualizar vehículo
 */
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;

    const vehicle = await Vehicle.update(id, vehicleData);

    if (!vehicle) {
      return sendError(res, 404, 'Vehículo no encontrado');
    }

    sendResponse(res, 200, {
      message: 'Vehículo actualizado exitosamente',
      vehicle,
    });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    sendError(res, 500, 'Error al actualizar vehículo', error.message);
  }
};

/**
 * Actualizar ubicación del vehículo
 */
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const vehicle = await Vehicle.updateLocation(id, lat, lng);

    if (!vehicle) {
      return sendError(res, 404, 'Vehículo no encontrado');
    }

    sendResponse(res, 200, {
      message: 'Ubicación actualizada',
      vehicle,
    });
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    sendError(res, 500, 'Error al actualizar ubicación', error.message);
  }
};

/**
 * Eliminar vehículo
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.delete(id);

    if (!vehicle) {
      return sendError(res, 404, 'Vehículo no encontrado');
    }

    sendResponse(res, 200, {
      message: 'Vehículo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    sendError(res, 500, 'Error al eliminar vehículo', error.message);
  }
};
