const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticate } = require('../middleware/auth');
const { hasAnyRole } = require('../middleware/roles');

/**
 * @route   GET /api/vehicles
 * @desc    Obtener todos los vehículos
 * @access  Private
 */
router.get('/', authenticate, vehicleController.getAllVehicles);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Obtener vehículo por ID
 * @access  Private
 */
router.get('/:id', authenticate, vehicleController.getVehicleById);

/**
 * @route   GET /api/vehicles/conductor/:conductorId
 * @desc    Obtener vehículos por conductor
 * @access  Private
 */
router.get('/conductor/:conductorId', authenticate, vehicleController.getVehiclesByConductor);

/**
 * @route   POST /api/vehicles
 * @desc    Crear nuevo vehículo
 * @access  Private/Conductor
 */
router.post('/', authenticate, hasAnyRole('conductor', 'admin'), vehicleController.createVehicle);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Actualizar vehículo
 * @access  Private/Conductor
 */
router.put('/:id', authenticate, hasAnyRole('conductor', 'admin'), vehicleController.updateVehicle);

/**
 * @route   PUT /api/vehicles/:id/location
 * @desc    Actualizar ubicación del vehículo
 * @access  Private/Conductor
 */
router.put('/:id/location', authenticate, hasAnyRole('conductor', 'admin'), vehicleController.updateLocation);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Eliminar vehículo
 * @access  Private/Conductor
 */
router.delete('/:id', authenticate, hasAnyRole('conductor', 'admin'), vehicleController.deleteVehicle);

module.exports = router;
