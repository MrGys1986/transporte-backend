const Trip = require('../models/Trip');
const { sendResponse, sendError } = require('../utils/response');
const { sendPushNotification } = require('../services/pushService');

/**
 * Obtener viajes disponibles
 */
exports.getAvailableTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await Trip.listDisponibles(parseInt(page), parseInt(limit));

    sendResponse(res, 200, result);
  } catch (error) {
    console.error('Error al obtener viajes:', error);
    sendError(res, 500, 'Error al obtener viajes', error.message);
  }
};

/**
 * Obtener viaje por ID
 */
exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      return sendError(res, 404, 'Viaje no encontrado');
    }

    sendResponse(res, 200, { trip });
  } catch (error) {
    console.error('Error al obtener viaje:', error);
    sendError(res, 500, 'Error al obtener viaje', error.message);
  }
};

/**
 * Obtener viajes del conductor
 */
exports.getConductorTrips = async (req, res) => {
  try {
    const { estado } = req.query;
    const conductorId = req.params.conductorId || req.user.id;

    const trips = await Trip.findByConductor(conductorId, estado);

    sendResponse(res, 200, { trips });
  } catch (error) {
    console.error('Error al obtener viajes:', error);
    sendError(res, 500, 'Error al obtener viajes', error.message);
  }
};

/**
 * Obtener viajes del pasajero
 */
exports.getPasajeroTrips = async (req, res) => {
  try {
    const { estado } = req.query;
    const pasajeroId = req.params.pasajeroId || req.user.id;

    const trips = await Trip.findByPasajero(pasajeroId, estado);

    sendResponse(res, 200, { trips });
  } catch (error) {
    console.error('Error al obtener viajes:', error);
    sendError(res, 500, 'Error al obtener viajes', error.message);
  }
};

/**
 * Crear nuevo viaje
 */
exports.createTrip = async (req, res) => {
  try {
    const tripData = req.body;
    
    // Si es conductor, asignar su ID
    if (req.user.rol === 'conductor') {
      tripData.conductor_id = req.user.id;
    }

    const trip = await Trip.create(tripData);

    sendResponse(res, 201, {
      message: 'Viaje creado exitosamente',
      trip,
    });
  } catch (error) {
    console.error('Error al crear viaje:', error);
    sendError(res, 500, 'Error al crear viaje', error.message);
  }
};

/**
 * Actualizar viaje
 */
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const tripData = req.body;

    const trip = await Trip.update(id, tripData);

    if (!trip) {
      return sendError(res, 404, 'Viaje no encontrado');
    }

    sendResponse(res, 200, {
      message: 'Viaje actualizado exitosamente',
      trip,
    });
  } catch (error) {
    console.error('Error al actualizar viaje:', error);
    sendError(res, 500, 'Error al actualizar viaje', error.message);
  }
};

/**
 * Actualizar estado del viaje
 */
exports.updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const trip = await Trip.updateEstado(id, estado);

    if (!trip) {
      return sendError(res, 404, 'Viaje no encontrado');
    }

    // Enviar notificación push
    try {
      await sendPushNotification(trip.pasajero_id, {
        title: 'Estado de viaje actualizado',
        body: `Tu viaje está ahora: ${estado}`,
        data: { tripId: id, estado },
      });
    } catch (notifError) {
      console.error('Error al enviar notificación:', notifError);
    }

    sendResponse(res, 200, {
      message: 'Estado actualizado exitosamente',
      trip,
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    sendError(res, 500, 'Error al actualizar estado', error.message);
  }
};

/**
 * Cancelar viaje
 */
exports.cancelTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const trip = await Trip.cancel(id, motivo);

    if (!trip) {
      return sendError(res, 404, 'Viaje no encontrado');
    }

    // Enviar notificación
    try {
      await sendPushNotification(trip.pasajero_id, {
        title: 'Viaje cancelado',
        body: motivo || 'Tu viaje ha sido cancelado',
        data: { tripId: id },
      });
    } catch (notifError) {
      console.error('Error al enviar notificación:', notifError);
    }

    sendResponse(res, 200, {
      message: 'Viaje cancelado exitosamente',
      trip,
    });
  } catch (error) {
    console.error('Error al cancelar viaje:', error);
    sendError(res, 500, 'Error al cancelar viaje', error.message);
  }
};

/**
 * Actualizar ubicación en tiempo real
 */
exports.updateTripLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const trip = await Trip.updateUbicacionActual(id, lat, lng);

    if (!trip) {
      return sendError(res, 404, 'Viaje no encontrado');
    }

    sendResponse(res, 200, {
      message: 'Ubicación actualizada',
      trip,
    });
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    sendError(res, 500, 'Error al actualizar ubicación', error.message);
  }
};
