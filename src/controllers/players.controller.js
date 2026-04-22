const playersService = require('../services/players.service');

const getCompatible = async (req, res, next) => {
  try {
    const jugadorId = req.jugador.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

    const players = await playersService.getCompatiblePlayers(jugadorId, page, limit);

    res.json({ page, limit, players });
  } catch (err) {
    next(err);
  }
};

const listPlayers = async (req, res, next) => {
  try {
    const result = await playersService.getFilteredPlayers(req.jugador.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getPlayerById = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);
    const myId = req.jugador.id;

    const profileData = await playersService.getPlayerProfile(targetId, myId);

    res.json(profileData);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCompatible, listPlayers, getPlayerById };