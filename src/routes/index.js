const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const userRoutes = require('./users');
const vehicleRoutes = require('./vehicles');
const routeRoutes = require('./routes');
const tripRoutes = require('./trips');
const notificationRoutes = require('./notifications');
const syncRoutes = require('./sync');

// Definir rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/routes', routeRoutes);
router.use('/trips', tripRoutes);
router.use('/notifications', notificationRoutes);
router.use('/sync', syncRoutes);

// Ruta raíz de API
router.get('/', (req, res) => {
  res.json({
    message: 'API de Transporte PWA',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      vehicles: '/api/vehicles',
      routes: '/api/routes',
      trips: '/api/trips',
      notifications: '/api/notifications',
      sync: '/api/sync',
    },
  });
});

module.exports = router;
