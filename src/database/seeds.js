const db = require('./connection');
const bcrypt = require('bcryptjs');

/**
 * Poblar base de datos con datos de prueba
 */
exports.seedDatabase = async () => {
  const client = await db.connect();

  try {
    console.log('🌱 Sembrando datos de prueba...');

    await client.query('BEGIN');

    // Usuario administrador
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO usuarios (nombre, email, password, telefono, rol)
      VALUES ('Administrador', 'admin@transporte.com', $1, '5512345678', 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [adminPassword]);

    // Conductores
    const conductorPassword = await bcrypt.hash('conductor123', 10);
    await client.query(`
      INSERT INTO usuarios (nombre, email, password, telefono, rol)
      VALUES 
        ('Juan Pérez', 'juan@conductor.com', $1, '5512345679', 'conductor'),
        ('María González', 'maria@conductor.com', $1, '5512345680', 'conductor')
      ON CONFLICT (email) DO NOTHING
    `, [conductorPassword]);

    // Pasajeros
    const pasajeroPassword = await bcrypt.hash('pasajero123', 10);
    await client.query(`
      INSERT INTO usuarios (nombre, email, password, telefono, rol)
      VALUES 
        ('Carlos Ruiz', 'carlos@pasajero.com', $1, '5512345681', 'pasajero'),
        ('Ana Martínez', 'ana@pasajero.com', $1, '5512345682', 'pasajero')
      ON CONFLICT (email) DO NOTHING
    `, [pasajeroPassword]);

    // Vehículos
    await client.query(`
      INSERT INTO vehiculos (conductor_id, marca, modelo, año, placa, color, capacidad, tipo)
      SELECT id, 'Toyota', 'Corolla', 2022, 'ABC-123', 'Blanco', 4, 'automovil'
      FROM usuarios WHERE email = 'juan@conductor.com'
      ON CONFLICT (placa) DO NOTHING
    `);

    await client.query(`
      INSERT INTO vehiculos (conductor_id, marca, modelo, año, placa, color, capacidad, tipo)
      SELECT id, 'Honda', 'CR-V', 2021, 'XYZ-789', 'Gris', 5, 'camioneta'
      FROM usuarios WHERE email = 'maria@conductor.com'
      ON CONFLICT (placa) DO NOTHING
    `);

    // Rutas
    await client.query(`
      INSERT INTO rutas (nombre, origen, destino, distancia_km, tiempo_estimado_min, precio)
      VALUES 
        ('Centro - Aeropuerto', 'Centro Histórico', 'Aeropuerto Internacional', 25.5, 45, 150.00),
        ('Universidad - Centro', 'Ciudad Universitaria', 'Centro Histórico', 15.2, 30, 80.00),
        ('Norte - Sur', 'Terminal Norte', 'Terminal Sur', 35.8, 60, 200.00)
      ON CONFLICT DO NOTHING
    `);

    await client.query('COMMIT');

    console.log('✅ Datos de prueba sembrados exitosamente');
    console.log('\n📝 Credenciales de prueba:');
    console.log('Admin: admin@transporte.com / admin123');
    console.log('Conductor: juan@conductor.com / conductor123');
    console.log('Pasajero: carlos@pasajero.com / pasajero123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al sembrar datos:', error);
    throw error;
  } finally {
    client.release();
  }
};
