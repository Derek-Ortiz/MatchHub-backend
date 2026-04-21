const db = require('../config/database');
const repo = require('../repositories/profile.repository');
const dicebear = require('./dicebear.service');

class ProfileService {
  
  async getFullProfile(jugadorId) {
    const [jugador, juegos, preferencias, disponibilidad] = await Promise.all([
      repo.getBasicInfo(jugadorId),
      repo.getGames(jugadorId),
      repo.getPreferences(jugadorId),
      repo.getAvailability(jugadorId)
    ]);

    return { ...jugador, juegos, preferencias, disponibilidad };
  }

  async updateFullProfile(jugadorId, data) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const { videojuego_ids, preferencia_ids, disponibilidad, ...basicData } = data;

      const jugadorActualizado = await repo.updateBasicData(client, jugadorId, basicData);

      if (Array.isArray(videojuego_ids)) {
        await repo.replaceGames(client, jugadorId, videojuego_ids);
      }
      if (Array.isArray(preferencia_ids)) {
        await repo.replacePreferences(client, jugadorId, preferencia_ids);
      }
      if (Array.isArray(disponibilidad)) {
        await repo.replaceAvailability(client, jugadorId, disponibilidad);
      }

      await client.query('COMMIT');
      return jugadorActualizado;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateOnlineStatus(jugadorId, isOnline) {
    return await repo.updateOnlineStatus(jugadorId, isOnline);
  }

  getAvatarOptions(seed) {
    return dicebear.getAvatarOptions(seed);
  }
}

module.exports = new ProfileService();