const repo = require('../repositories/players.repository');
const ApiError = require('../utils/ApiError');

class PlayersService {
  
  async getCompatiblePlayers(jugadorId, page, limit) {
    const rows = await repo.getCompatible(jugadorId, page, limit);

    return rows.map((r) => ({
      ...r,
      total_score: parseFloat(
        (parseFloat(r.horario_score) + parseFloat(r.juego_score) + parseFloat(r.preferencia_score)).toFixed(2)
      ),
    }));
  }

  async getFilteredPlayers(jugadorId, queryFilters) {
    const { region, estilo_juego, plataforma, videojuego_id, page = 1, limit = 20 } = queryFilters;
    
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    const filters = { region, estilo_juego, plataforma, videojuego_id };
    
    const players = await repo.findPlayers(jugadorId, filters, parsedLimit, offset);
    
    return { page: parsedPage, limit: parsedLimit, players };
  }

  async getPlayerProfile(targetId, myId) {
    const player = await repo.getBasicProfile(targetId);
    if (!player) throw ApiError.notFound('Jugador no encontrado.');

    const [hasActiveMatch, juegos, preferencias, disponibilidad] = await Promise.all([
      repo.checkActiveMatch(myId, targetId),
      repo.getGames(targetId),
      repo.getPreferences(targetId),
      repo.getAvailability(targetId)
    ]);

    player.discord_id = hasActiveMatch ? await repo.getDiscordId(targetId) : null;


    let compatibilidad = null;
    if (myId !== targetId) {
      const scores = await repo.getCompatible(myId, 1, 200); 
      const found = scores.find((s) => s.id === targetId);
      
      if (found) {
        compatibilidad = {
          horario_score: found.horario_score,
          juego_score: found.juego_score,
          preferencia_score: found.preferencia_score,
          total: parseFloat(
            (parseFloat(found.horario_score) +
             parseFloat(found.juego_score) +
             parseFloat(found.preferencia_score)).toFixed(2)
          ),
        };
      }
    }

    return { player, juegos, preferencias, disponibilidad, compatibilidad };
  }
}

module.exports = new PlayersService();