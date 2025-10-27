const { runMigrations } = require('../src/database/migrations');

async function migrate() {
  try {
    console.log('🔄 Iniciando migraciones de base de datos...\n');
    await runMigrations();
    console.log('\n✅ Proceso de migración completado');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en el proceso de migración:', error);
    process.exit(1);
  }
}

migrate();
