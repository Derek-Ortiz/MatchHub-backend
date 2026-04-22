const db = require('../config/database');

class GamesRepository {
  async getAllActiveGames() {
    const { rows } = await db.query(
      "SELECT id, nombre, rawg_id, plataformas, origen FROM videojuegos WHERE activo = TRUE ORDER BY nombre"
    );
    return rows;
  }

  async upsertGame(gameData) {
    const { nombre, rawg_id, plataformas, origen } = gameData;
    
    const { rows } = await db.query(
      `INSERT INTO videojuegos (nombre, rawg_id, plataformas, origen)
       VALUES ($1, $2, $3::jsonb, $4)
       ON CONFLICT (nombre) DO UPDATE SET plataformas = EXCLUDED.plataformas
       RETURNING id, nombre, rawg_id, plataformas, origen`,
      [nombre, rawg_id, JSON.stringify(plataformas), origen]
    );
    
    return rows[0];
  }
}

module.exports = new GamesRepository();