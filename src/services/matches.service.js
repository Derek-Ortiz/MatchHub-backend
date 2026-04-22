const repo = require('../repositories/matches.repository');
const ApiError = require('../utils/ApiError');

class MatchesService {
  async listUserMatches(jugadorId) {
    return await repo.getActiveMatches(jugadorId);
  }

  async getMatchDetails(matchId, jugadorId) {
    const match = await repo.getMatchById(matchId, jugadorId);
    
    if (!match) {
      throw ApiError.notFound('Match no encontrado o no tienes permisos para verlo.');
    }
    
    return match;
  }

  async getUserDashboardStats(jugadorId) {
    const [nuevas_conexiones, juegos_activos, dias_semana] = await Promise.all([
      repo.countActiveConnections(jugadorId),
      repo.countActiveGames(jugadorId),
      repo.countAvailableDays(jugadorId)
    ]);

    return {
      nuevas_conexiones,
      juegos_activos,
      dias_semana
    };
  }
}

module.exports = new MatchesService();