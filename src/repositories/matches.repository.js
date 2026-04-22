const db = require('../config/database');

class MatchesRepository {
  async getActiveMatches(jugadorId) {
    const { rows } = await db.query(
      `SELECT
         m.id,
         m.estado,
         m.fecha_juego_planeada,
         m.created_at,
         v.id   AS videojuego_id,
         v.nombre AS videojuego_nombre,
         -- Datos del otro jugador
         CASE WHEN m.jugador_1_id = $1 THEN j2.id     ELSE j1.id     END AS otro_jugador_id,
         CASE WHEN m.jugador_1_id = $1 THEN j2.username ELSE j1.username END AS otro_username,
         CASE WHEN m.jugador_1_id = $1 THEN j2.avatar_url ELSE j1.avatar_url END AS otro_avatar,
         CASE WHEN m.jugador_1_id = $1 THEN j2.discord_id ELSE j1.discord_id END AS otro_discord,
         CASE WHEN m.jugador_1_id = $1 THEN j2.is_online ELSE j1.is_online END AS otro_is_online
       FROM match m
       JOIN jugadores j1 ON m.jugador_1_id = j1.id
       JOIN jugadores j2 ON m.jugador_2_id = j2.id
       JOIN videojuegos v ON m.videojuego_id = v.id
       WHERE (m.jugador_1_id = $1 OR m.jugador_2_id = $1)
         AND m.estado = 'activo'
         AND m.deleted_at IS NULL
       ORDER BY m.created_at DESC`,
      [jugadorId]
    );
    return rows;
  }

  async getMatchById(matchId, jugadorId) {
    const { rows } = await db.query(
      `SELECT m.*, v.nombre AS videojuego_nombre,
         j1.username AS jugador1_username, j1.avatar_url AS jugador1_avatar,
         j2.username AS jugador2_username, j2.avatar_url AS jugador2_avatar
       FROM match m
       JOIN videojuegos v ON m.videojuego_id = v.id
       JOIN jugadores j1 ON m.jugador_1_id = j1.id
       JOIN jugadores j2 ON m.jugador_2_id = j2.id
       WHERE m.id = $1
         AND (m.jugador_1_id = $2 OR m.jugador_2_id = $2)
         AND m.deleted_at IS NULL`,
      [matchId, jugadorId]
    );
    return rows[0];
  }

  async countActiveConnections(jugadorId) {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS total FROM match
       WHERE (jugador_1_id = $1 OR jugador_2_id = $1) AND estado = 'activo'`,
      [jugadorId]
    );
    return rows[0].total;
  }

  async countActiveGames(jugadorId) {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS total FROM videojuegos_jugador WHERE jugador_id = $1`,
      [jugadorId]
    );
    return rows[0].total;
  }

  async countAvailableDays(jugadorId) {
    const { rows } = await db.query(
      `SELECT COUNT(DISTINCT dia_semana)::int AS total FROM disponibilidad
       WHERE jugador_id = $1 AND activo = TRUE`,
      [jugadorId]
    );
    return rows[0].total;
  }
}

module.exports = new MatchesRepository();