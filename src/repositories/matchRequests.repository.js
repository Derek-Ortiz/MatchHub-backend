const db = require('../config/database');

class MatchRequestsRepository {
  async checkReceptorExists(receptorId) {
    const { rows } = await db.query(
      "SELECT id FROM jugadores WHERE id = $1 AND estado = 'activo' AND deleted_at IS NULL",
      [receptorId]
    );
    return rows.length > 0;
  }

  async checkPendingRequest(solicitanteId, receptorId) {
    const { rows } = await db.query(
      `SELECT 1 FROM solicitudes_match
       WHERE ((jugador_solicitante_id = $1 AND jugador_receptor_id = $2)
           OR (jugador_solicitante_id = $2 AND jugador_receptor_id = $1))
         AND estado = 'pendiente'
         AND fecha_expiracion > NOW()
         AND deleted_at IS NULL LIMIT 1`,
      [solicitanteId, receptorId]
    );
    return rows.length > 0;
  }

  async checkActiveMatch(solicitanteId, receptorId) {
    const { rows } = await db.query(
      `SELECT 1 FROM match
       WHERE ((jugador_1_id = $1 AND jugador_2_id = $2) OR (jugador_1_id = $2 AND jugador_2_id = $1))
         AND estado = 'activo' LIMIT 1`,
      [solicitanteId, receptorId]
    );
    return rows.length > 0;
  }

  async getCompatibilityScore(solicitanteId, receptorId) {
    const { rows } = await db.query('SELECT * FROM sp_buscar_compatibles($1, 1, 500)', [solicitanteId]);
    const target = rows.find((r) => r.id === receptorId);
    return target ? (parseFloat(target.horario_score) + parseFloat(target.juego_score) + parseFloat(target.preferencia_score)) : 0;
  }

  async createRequest(solicitanteId, receptorId, expiracion, score) {
    const { rows } = await db.query(
      `INSERT INTO solicitudes_match (jugador_solicitante_id, jugador_receptor_id, fecha_expiracion, compatibility_score)
       VALUES ($1, $2, $3, $4)
       RETURNING id, estado, compatibility_score, created_at`,
      [solicitanteId, receptorId, expiracion, score]
    );
    return rows[0];
  }

  async getReceived(jugadorId) {
    const { rows } = await db.query('SELECT * FROM sp_obtener_solicitudes_recibidas($1)', [jugadorId]);
    return rows;
  }

  async getSent(jugadorId) {
    const { rows } = await db.query(
      `SELECT sm.id, sm.jugador_receptor_id, j.username AS receptor_username, j.avatar_url AS receptor_avatar,
              sm.estado, sm.compatibility_score, sm.created_at
       FROM solicitudes_match sm
       JOIN jugadores j ON sm.jugador_receptor_id = j.id
       WHERE sm.jugador_solicitante_id = $1 AND sm.deleted_at IS NULL
       ORDER BY sm.created_at DESC`,
      [jugadorId]
    );
    return rows;
  }

  async getPendingRequestForReceptor(client, solicitudId, receptorId) {
    const { rows } = await client.query(
      `SELECT * FROM solicitudes_match WHERE id = $1 AND jugador_receptor_id = $2
       AND estado = 'pendiente' AND fecha_expiracion > NOW() AND deleted_at IS NULL`,
      [solicitudId, receptorId]
    );
    return rows[0];
  }

  async updateRequestStatus(client, solicitudId, estado) {
    await client.query(`UPDATE solicitudes_match SET estado = $2, updated_at = NOW() WHERE id = $1`, [solicitudId, estado]);
  }

  async createMatch(client, j1, j2) {
    const { rows } = await client.query(
      `INSERT INTO match (jugador_1_id, jugador_2_id, confirmado_por_receptor_en)
       VALUES ($1, $2, NOW()) RETURNING id, estado, created_at`,
      [j1, j2]
    );
    return rows[0];
  }
}

module.exports = new MatchRequestsRepository();