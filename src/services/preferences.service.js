const repo = require('../repositories/preferences.repository');
const ApiError = require('../utils/ApiError');

class PreferencesService {
  async listActivePreferences(jugadorId) {
    return await repo.getActivePreferences(jugadorId);
  }

  async comparePreferences(myId, otherId) {
    if (isNaN(otherId)) {
      throw ApiError.badRequest('El parámetro other_id debe ser un número válido.');
    }
    return await repo.compareWithPlayer(myId, otherId);
  }
}

module.exports = new PreferencesService();