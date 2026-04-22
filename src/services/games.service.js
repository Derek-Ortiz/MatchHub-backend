const repo = require('../repositories/games.repository');
const rawg = require('./rawg.service');
const ApiError = require('../utils/ApiError');

class GamesService {
  
  async getLocalGames() {
    return await repo.getAllActiveGames();
  }

  async searchExternalGames(query, limit = 10) {
    if (!query || query.trim().length < 2) {
      throw ApiError.badRequest('El término de búsqueda debe tener al menos 2 caracteres.');
    }
    
    return await rawg.searchGames(query.trim(), parseInt(limit));
  }

  async addGameToLibrary(data) {
    const { rawg_id, nombre, plataformas } = data;
    let gameData = { 
      nombre, 
      plataformas: plataformas || [], 
      rawg_id: null, 
      origen: 'custom' 
    };

    if (rawg_id) {
      const rawgGame = await rawg.getGameById(rawg_id);
      
      if (!rawgGame) {
        throw ApiError.notFound('El juego no existe en la base de datos de RAWG.');
      }

      gameData = {
        nombre: rawgGame.nombre,
        plataformas: rawgGame.plataformas,
        rawg_id: rawgGame.rawg_id,
        origen: 'rawg',
      };
    } else if (!nombre) {
      throw ApiError.badRequest('Debes proporcionar un nombre si el juego es custom.');
    }

    return await repo.upsertGame(gameData);
  }
}

module.exports = new GamesService();