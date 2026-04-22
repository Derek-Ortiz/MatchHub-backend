const db = require('../config/database');

class PreferencesRepository {
  async getActivePreferences(jugadorId) {
    const { rows } = await db.query(
      `SELECT p.id, p.nombre, p.descripcion,
              EXISTS (
                SELECT 1 FROM jugador_preferencias jp
                WHERE jp.preferencia_id = p.id AND jp.jugador_id = $1
              ) AS selected
       FROM preferencias p
       WHERE p.activo = TRUE
         AND (p.creador_id IS NULL OR p.creador_id = $1)
       ORDER BY p.creador_id NULLS FIRST, p.nombre`,
      [jugadorId]
    );
    return rows;
  }

  async compareWithPlayer(myId, otherId) {
    const { rows } = await db.query(
      'SELECT * FROM sp_obtener_preferencias_con_porcentaje($1, $2)',
      [myId, otherId]
    );
    return rows;
  }
}

module.exports = new PreferencesRepository();