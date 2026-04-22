const preferencesService = require('../services/preferences.service');

const listPreferences = async (req, res, next) => {
  try {
    const preferences = await preferencesService.listActivePreferences(req.jugador.id);
    res.json({ preferences });
  } catch (err) {
    next(err);
  }
};

const comparePreferences = async (req, res, next) => {
  try {
    const comparison = await preferencesService.comparePreferences(req.jugador.id, parseInt(req.query.other_id));
    res.json({ comparison });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPreferences, comparePreferences };