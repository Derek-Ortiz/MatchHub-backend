const { createClerkClient } = require('@clerk/clerk-sdk-node');
const env = require('../config/env');
const db = require('../config/database');

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación requerido.' });
    }

    const token = authHeader.split(' ')[1];
    const { sub: clerkUserId } = await clerk.verifyToken(token);

    req.clerkUserId = clerkUserId;

    const { rows } = await db.query(
      'SELECT id, username, email, estado, deleted_at FROM jugadores WHERE clerk_user_id = $1',
      [clerkUserId]
    );

    if (rows.length > 0) {
      const jugador = rows[0];
      if (jugador.deleted_at) {
        return res.status(403).json({ error: 'Cuenta eliminada.' });
      }
      if (jugador.estado === 'baneado') {
        return res.status(403).json({ error: 'Cuenta baneada.' });
      }
      req.jugador = jugador;
    }

    next();
  } catch (err) {
    if (err.message?.includes('token') || err.message?.includes('JWT')) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
    next(err);
  }
};


const requireProfile = (req, res, next) => {
  if (!req.jugador) {
    return res.status(403).json({
      error: 'Perfil no completado.',
      code: 'PROFILE_REQUIRED',
    });
  }
  next();
};

module.exports = { requireAuth, requireProfile };
