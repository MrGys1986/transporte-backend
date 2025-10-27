const db = require('./connection');

/**
 * Crear tablas de la base de datos
 */
exports.runMigrations = async () => {
  const client = await db.connect();

  try {
    console.log('🚀 Ejecutando migraciones...');

    await client.query('BEGIN');

    // Tabla de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        rol VARCHAR(20) DEFAULT 'pasajero',
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla de vehículos
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehiculos (
        id SERIAL PRIMARY KEY,
        conductor_id INTEGER REFERENCES usuarios(id),
        marca VARCHAR(50) NOT NULL,
        modelo VARCHAR(50) NOT NULL,
        año INTEGER,
        placa VARCHAR(20) UNIQUE NOT NULL,
        color VARCHAR(30),
        capacidad INTEGER DEFAULT 4,
        tipo VARCHAR(20) DEFAULT 'automovil',
        ultima_latitud DECIMAL(10, 8),
        ultima_longitud DECIMAL(11, 8),
        ultima_ubicacion TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla de rutas
    await client.query(`
      CREATE TABLE IF NOT EXISTS rutas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        origen VARCHAR(255) NOT NULL,
        destino VARCHAR(255) NOT NULL,
        origen_lat DECIMAL(10, 8),
        origen_lng DECIMAL(11, 8),
        destino_lat DECIMAL(10, 8),
        destino_lng DECIMAL(11, 8),
        distancia_km DECIMAL(10, 2),
        tiempo_estimado_min INTEGER,
        precio DECIMAL(10, 2),
        puntos_intermedios JSONB,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla de viajes
    await client.query(`
      CREATE TABLE IF NOT EXISTS viajes (
        id SERIAL PRIMARY KEY,
        ruta_id INTEGER REFERENCES rutas(id),
        vehiculo_id INTEGER REFERENCES vehiculos(id),
        conductor_id INTEGER REFERENCES usuarios(id),
        pasajero_id INTEGER REFERENCES usuarios(id),
        origen VARCHAR(255) NOT NULL,
        destino VARCHAR(255) NOT NULL,
        fecha_salida TIMESTAMP NOT NULL,
        precio DECIMAL(10, 2),
        estado VARCHAR(20) DEFAULT 'pendiente',
        ubicacion_actual_lat DECIMAL(10, 8),
        ubicacion_actual_lng DECIMAL(11, 8),
        fecha_ultima_ubicacion TIMESTAMP,
        motivo_cancelacion TEXT,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla de notificaciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        titulo VARCHAR(100) NOT NULL,
        mensaje TEXT NOT NULL,
        tipo VARCHAR(20) DEFAULT 'info',
        data JSONB,
        leida BOOLEAN DEFAULT false,
        fecha_lectura TIMESTAMP,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla de suscripciones push
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        endpoint TEXT UNIQUE NOT NULL,
        keys JSONB NOT NULL,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // Crear índices
    await client.query('CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_vehiculos_conductor ON vehiculos(conductor_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_viajes_conductor ON viajes(conductor_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_viajes_pasajero ON viajes(pasajero_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id)');

    await client.query('COMMIT');

    console.log('✅ Migraciones completadas exitosamente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migraciones:', error);
    throw error;
  } finally {
    client.release();
  }
};
