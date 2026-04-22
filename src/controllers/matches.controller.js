const matchesService = require('../services/matches.service');

const listMatches = async (req, res, next) => {
  try {
    const matches = await matchesService.listUserMatches(req.jugador.id);
    res.json({ matches });
  } catch (err) {
    next(err);
  }
};

const getMatch = async (req, res, next) => {
  try {
    const matchId = parseInt(req.params.id);
    const match = await matchesService.getMatchDetails(matchId, req.jugador.id);
    res.json({ match });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await matchesService.getUserDashboardStats(req.jugador.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { listMatches, getMatch, getStats };