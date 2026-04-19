const app = require('./app');
const env = require('./config/env');
const { pool } = require('./config/database');

const server = app.listen(env.PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`Base de datos conectada correctamente.`);
  } catch (err) {
    console.error('Error conectando a la base de datos:', err.message);
    process.exit(1);
  }
  console.log(`MatchHub API corriendo en http://localhost:${env.PORT}`);

});

const shutdown = async (signal) => {
  console.log(`\nSeñal ${signal} recibida. Cerrando servidor...`);
  server.close(async () => {
    await pool.end();
    console.log('Servidor cerrado correctamente.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
