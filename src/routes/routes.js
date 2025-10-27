const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const { cacheMiddleware } = require('../middleware/cache');

/**
 * @route   GET /api/routes
 * @desc    Obtener todas las rutas
 * @access  Public
 */
router.get('/', optionalAuth, cacheMiddleware(300), routeController.getAllRoutes);

/**
 * @route   GET /api/routes/search
 * @desc    Buscar rutas por origen y destino
 * @access  Public
 */
router.get('/search', optionalAuth, routeController.searchRoutes);

/**
 * @route   GET /api/routes/nearby
 * @desc    Buscar rutas cercanas
 * @access  Public
 */
router.get('/nearby', optionalAuth, routeController.getNearbyRoutes);

/**
 * @route   GET /api/routes/:id
 * @desc    Obtener ruta por ID
 * @access  Public
 */
router.get('/:id', optionalAuth, cacheMiddleware(300), routeController.getRouteById);

/**
 * @route   POST /api/routes
 * @desc    Crear nueva ruta
 * @access  Private/Admin
 */
router.post('/', authenticate, isAdmin, routeController.createRoute);

/**
 * @route   PUT /api/routes/:id
 * @desc    Actualizar ruta
 * @access  Private/Admin
 */
router.put('/:id', authenticate, isAdmin, routeController.updateRoute);

/**
 * @route   DELETE /api/routes/:id
 * @desc    Eliminar ruta
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, isAdmin, routeController.deleteRoute);

module.exports = router;
