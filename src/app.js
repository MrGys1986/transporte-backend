const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const corsOptions = require('./config/cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();

// Seguridad con configuración para PWA
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://maps.googleapis.com'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compresión
app.use(compression());

// Logger HTTP
app.use(morgan('combined'));
app.use(logger);

// Archivos estáticos
app.use(express.static('public'));

// Servir manifest.json con el Content-Type correcto
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile('manifest.json', { root: 'public' });
});

// Servir service-worker.js con el Content-Type correcto
app.get('/service-worker.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile('service-worker.js', { root: 'public' });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rutas de API
app.use('/api', routes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Manejador de errores
app.use(errorHandler);

module.exports = app;
