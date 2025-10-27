const { seedDatabase } = require('../src/database/seeds');

async function seed() {
  try {
    console.log('🔄 Iniciando proceso de seed...\n');
    await seedDatabase();
    console.log('\n✅ Proceso de seed completado');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en el proceso de seed:', error);
    process.exit(1);
  }
}

seed();
