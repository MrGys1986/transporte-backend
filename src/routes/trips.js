const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticate } = require('../middleware/auth');
const { hasAnyRole } = require('../middleware/roles');

/**
 * @route   GET /api/trips/available
 * @desc    Obtener viajes disponibles
 * @access  Private
 */
router.get('/available', authenticate, tripController.getAvailableTrips);

/**
 * @route   GET /api/trips/:id
 * @desc    Obtener viaje por ID
 * @access  Private
 */
router.get('/:id', authenticate, tripController.getTripById);

/**
 * @route   GET /api/trips/conductor/:conductorId
 * @desc    Obtener viajes del conductor
 * @access  Private
 */
router.get('/conductor/:conductorId', authenticate, tripController.getConductorTrips);

/**
 * @route   GET /api/trips/pasajero/:pasajeroId
 * @desc    Obtener viajes del pasajero
 * @access  Private
 */
router.get('/pasajero/:pasajeroId', authenticate, tripController.getPasajeroTrips);

/**
 * @route   POST /api/trips
 * @desc    Crear nuevo viaje
 * @access  Private/Conductor
 */
router.post('/', authenticate, hasAnyRole('conductor', 'admin'), tripController.createTrip);

/**
 * @route   PUT /api/trips/:id
 * @desc    Actualizar viaje
 * @access  Private/Conductor
 */
router.put('/:id', authenticate, hasAnyRole('conductor', 'admin'), tripController.updateTrip);

/**
 * @route   PUT /api/trips/:id/status
 * @desc    Actualizar estado del viaje
 * @access  Private/Conductor
 */
router.put('/:id/status', authenticate, hasAnyRole('conductor', 'admin'), tripController.updateTripStatus);

/**
 * @route   PUT /api/trips/:id/location
 * @desc    Actualizar ubicación del viaje en tiempo real
 * @access  Private/Conductor
 */
router.put('/:id/location', authenticate, hasAnyRole('conductor', 'admin'), tripController.updateTripLocation);

/**
 * @route   POST /api/trips/:id/cancel
 * @desc    Cancelar viaje
 * @access  Private
 */
router.post('/:id/cancel', authenticate, tripController.cancelTrip);

module.exports = router;
