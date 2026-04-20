const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  if (err.type === 'validation') {
    return res.status(422).json({ error: 'Datos de entrada inválidos.', details: err.details });
  }

  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({ error: 'El recurso ya existe.', detail: err.detail });
      case '23503': // foreign_key_violation
        return res.status(400).json({ error: 'Referencia inválida.', detail: err.detail });
      case '23514': // check_violation
        return res.status(400).json({ error: 'Datos fuera de rango.', detail: err.detail });
      default:
        break;
    }
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Error interno del servidor.';

  res.status(status).json({
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada.` });
};

module.exports = { errorHandler, notFound };
