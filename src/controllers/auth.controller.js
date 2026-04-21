const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { username, discord_id } = req.body;
    const { jugador, alreadyRegistered } = await authService.registerUser(req.clerkUserId, username, discord_id);

    const statusCode = alreadyRegistered ? 200 : 201;
    const message = alreadyRegistered 
      ? 'Jugador ya registrado.' 
      : 'Cuenta creada correctamente. Completa tu perfil para empezar.';

    res.status(statusCode).json({ message, jugador, profileComplete: alreadyRegistered });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const status = await authService.getMeStatus(req.jugador, req.clerkUserId);
    res.json(status);
  } catch (err) {
    next(err);
  }
};

const checkUsername = async (req, res, next) => {
  try {
    const result = await authService.isUsernameAvailable(req.body.username);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, me, checkUsername };