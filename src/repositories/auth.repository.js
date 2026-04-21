const db = require('../config/database');

class AuthRepository {
  async findByClerkId(clerkUserId) {
    const { rows } = await db.query(
      `SELECT id, username, email, avatar_url, estilo_juego, region, estado
       FROM jugadores WHERE clerk_user_id = $1`,
      [clerkUserId]
    );
    return rows[0];
  }

  async findDuplicate(username, email) {
    const { rows } = await db.query(
      'SELECT id FROM jugadores WHERE username = $1 OR email = $2',
      [username, email]
    );
    return rows.length > 0;
  }

  async checkUsernameAvailability(username) {
    const { rows } = await db.query(
      'SELECT id FROM jugadores WHERE username = $1',
      [username.toLowerCase().trim()]
    );
    return rows.length === 0;
  }

  async createPlayer(data) {
    const { clerkUserId, username, email, discordId, avatarUrl } = data;
    const { rows } = await db.query(
      `INSERT INTO jugadores
         (clerk_user_id, username, email, discord_id, avatar_url,
          estilo_juego, region, plataformas)
       VALUES ($1, $2, $3, $4, $5, 'casual', 'centro', '[]'::jsonb)
       RETURNING id, username, email, avatar_url, estilo_juego, region`,
      [clerkUserId, username, email, discordId, avatarUrl]
    );
    return rows[0];
  }

  async getProfileCompletionStats(jugadorId) {
    const { rows } = await db.query(
      `SELECT
          (SELECT COUNT(*) FROM videojuegos_jugador  WHERE jugador_id = $1)::int AS juegos,
          (SELECT COUNT(*) FROM disponibilidad       WHERE jugador_id = $1 AND activo = TRUE)::int AS dias`,
      [jugadorId]
    );
    return rows[0];
  }
}

module.exports = new AuthRepository();