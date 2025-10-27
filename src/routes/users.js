const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios
 * @access  Private/Admin
 */
router.get('/', authenticate, isAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private/Admin
 */
router.get('/:id', authenticate, isAdmin, userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario
 * @access  Private/Admin
 */
router.post('/', authenticate, isAdmin, userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario
 * @access  Private/Admin
 */
router.put('/:id', authenticate, isAdmin, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);

module.exports = router;
