const db = require('../config/database');

class ProfileRepository {
  async getBasicInfo(jugadorId) {
    const { rows } = await db.query(
      `SELECT id, username, email, discord_id, avatar_url, descripcion,
              estilo_juego, region, plataformas, is_online, estado, created_at
       FROM jugadores WHERE id = $1`,
      [jugadorId]
    );
    return rows[0];
  }

  async getGames(jugadorId) {
    const { rows } = await db.query(
      `SELECT v.id, v.nombre, v.rawg_id, v.plataformas
       FROM videojuegos_jugador vj
       JOIN videojuegos v ON vj.videojuego_id = v.id
       WHERE vj.jugador_id = $1 ORDER BY v.nombre`,
      [jugadorId]
    );
    return rows;
  }

  async getPreferences(jugadorId) {
    const { rows } = await db.query(
      `SELECT p.id, p.nombre, p.descripcion
       FROM jugador_preferencias jp
       JOIN preferencias p ON jp.preferencia_id = p.id
       WHERE jp.jugador_id = $1 ORDER BY p.nombre`,
      [jugadorId]
    );
    return rows;
  }

  async getAvailability(jugadorId) {
    const { rows } = await db.query(
      `SELECT id, dia_semana, hora_inicio, hora_fin, timezone, activo
       FROM disponibilidad WHERE jugador_id = $1 AND activo = TRUE
       ORDER BY dia_semana`,
      [jugadorId]
    );
    return rows;
  }

  async updateOnlineStatus(jugadorId, isOnline) {
    await db.query(
      'UPDATE jugadores SET is_online = $1, updated_at = NOW() WHERE id = $2',
      [Boolean(isOnline), jugadorId]
    );
    return Boolean(isOnline);
  }

  // Métodos para la transacción de actualización
  async updateBasicData(client, jugadorId, data) {
    const { username, discord_id, descripcion, estilo_juego, region, plataformas, avatar_url } = data;
    const { rows } = await client.query(
      `UPDATE jugadores SET
          username      = COALESCE($1, username),
          discord_id    = COALESCE($2, discord_id),
          descripcion   = COALESCE($3, descripcion),
          estilo_juego  = COALESCE($4, estilo_juego),
          region        = COALESCE($5, region),
          plataformas   = COALESCE($6::jsonb, plataformas),
          avatar_url    = COALESCE($7, avatar_url),
          updated_at    = NOW()
       WHERE id = $8
       RETURNING id, username, email, discord_id, avatar_url, descripcion,
                 estilo_juego, region, plataformas, is_online`,
      [username, discord_id, descripcion, estilo_juego, region,
       plataformas ? JSON.stringify(plataformas) : null,
       avatar_url, jugadorId]
    );
    return rows[0];
  }

  async replaceGames(client, jugadorId, videojuego_ids) {
    await client.query('DELETE FROM videojuegos_jugador WHERE jugador_id = $1', [jugadorId]);
    for (const vid of videojuego_ids) {
      await client.query(
        'INSERT INTO videojuegos_jugador (jugador_id, videojuego_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [jugadorId, vid]
      );
    }
  }

  async replacePreferences(client, jugadorId, preferencia_ids) {
    await client.query('DELETE FROM jugador_preferencias WHERE jugador_id = $1', [jugadorId]);
    for (const pid of preferencia_ids) {
      await client.query(
        'INSERT INTO jugador_preferencias (jugador_id, preferencia_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [jugadorId, pid]
      );
    }
  }

  async replaceAvailability(client, jugadorId, disponibilidad) {
    await client.query('DELETE FROM disponibilidad WHERE jugador_id = $1', [jugadorId]);
    for (const slot of disponibilidad) {
      await client.query(
        `INSERT INTO disponibilidad (jugador_id, dia_semana, hora_inicio, hora_fin, timezone)
         VALUES ($1, $2, $3, $4, $5)`,
        [jugadorId, slot.dia_semana, slot.hora_inicio, slot.hora_fin,
         slot.timezone || 'America/Mexico_City']
      );
    }
  }
}

module.exports = new ProfileRepository();