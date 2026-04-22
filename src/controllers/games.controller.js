const gamesService = require('../services/games.service');

const listGames = async (req, res, next) => {
  try {
    const games = await gamesService.getLocalGames();
    res.json({ games });
  } catch (err) {
    next(err);
  }
};

const searchGames = async (req, res, next) => {
  try {
    const { q, limit } = req.query;
    const results = await gamesService.searchExternalGames(q, limit);
    res.json({ results });
  } catch (err) {
    next(err);
  }
};

const addGame = async (req, res, next) => {
  try {
    const game = await gamesService.addGameToLibrary(req.body);
    res.status(201).json({ game });
  } catch (err) {
    next(err);
  }
};

module.exports = { listGames, searchGames, addGame };