const db = require('../config/database');

class PlayersRepository {
  /**
   * Ejecuta el SP para buscar jugadores compatibles.
   */
  async getCompatible(jugadorId, page, limit) {
    const { rows } = await db.query(
      'SELECT * FROM sp_buscar_compatibles($1, $2, $3)',
      [jugadorId, page, limit]
    );
    return rows;
  }

  /**
   * Construye y ejecuta la consulta dinámica para buscar jugadores.
   */
  async findPlayers(jugadorId, filters, limit, offset) {
    const { region, estilo_juego, plataforma, videojuego_id } = filters;
    const params = [jugadorId];
    const conditions = [
      'j.id <> $1',
      "j.estado = 'activo'",
      'j.deleted_at IS NULL',
    ];
    let idx = 2;

    if (region) { conditions.push(`j.region = $${idx++}`); params.push(region); }
    if (estilo_juego) { conditions.push(`j.estilo_juego = $${idx++}`); params.push(estilo_juego); }
    if (plataforma) {
      conditions.push(`j.plataformas @> $${idx++}::jsonb`);
      params.push(JSON.stringify([plataforma]));
    }
    if (videojuego_id) {
      conditions.push(
        `EXISTS (SELECT 1 FROM videojuegos_jugador vj WHERE vj.jugador_id = j.id AND vj.videojuego_id = $${idx++})`
      );
      params.push(parseInt(videojuego_id));
    }

    params.push(parseInt(limit), offset);
    
    const sql = `
      SELECT j.id, j.username, j.avatar_url, j.estilo_juego, j.region, j.plataformas, j.is_online
      FROM jugadores j
      WHERE ${conditions.join(' AND ')}
      ORDER BY j.username ASC
      LIMIT $${idx - 2} OFFSET $${idx - 1} 
    `; // Ajuste de índices para LIMIT y OFFSET según el push anterior

    const { rows } = await db.query(sql, params);
    return rows;
  }

  // --- MÉTODOS PARA EL PERFIL PÚBLICO ---

  async getBasicProfile(targetId) {
    const { rows } = await db.query(
      `SELECT id, username, avatar_url, descripcion, estilo_juego,
              region, plataformas, is_online, created_at
       FROM jugadores WHERE id = $1 AND estado = 'activo' AND deleted_at IS NULL`,
      [targetId]
    );
    return rows[0];
  }

  async checkActiveMatch(myId, targetId) {
    const { rows } = await db.query(
      `SELECT id FROM match
       WHERE ((jugador_1_id = $1 AND jugador_2_id = $2) OR (jugador_1_id = $2 AND jugador_2_id = $1))
         AND estado = 'activo'`,
      [myId, targetId]
    );
    return rows.length > 0;
  }

  async getDiscordId(targetId) {
    const { rows } = await db.query('SELECT discord_id FROM jugadores WHERE id = $1', [targetId]);
    return rows[0]?.discord_id || null;
  }

  async getGames(targetId) {
    const { rows } = await db.query(
      `SELECT v.id, v.nombre FROM videojuegos_jugador vj
       JOIN videojuegos v ON vj.videojuego_id = v.id WHERE vj.jugador_id = $1`,
      [targetId]
    );
    return rows;
  }

  async getPreferences(targetId) {
    const { rows } = await db.query(
      `SELECT p.id, p.nombre FROM jugador_preferencias jp
       JOIN preferencias p ON jp.preferencia_id = p.id WHERE jp.jugador_id = $1`,
      [targetId]
    );
    return rows;
  }

  async getAvailability(targetId) {
    const { rows } = await db.query(
      `SELECT dia_semana, hora_inicio, hora_fin FROM disponibilidad
       WHERE jugador_id = $1 AND activo = TRUE ORDER BY dia_semana`,
      [targetId]
    );
    return rows;
  }
}

module.exports = new PlayersRepository();