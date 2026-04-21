const profileService = require('../services/profile.service');

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getFullProfile(req.jugador.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const jugadorActualizado = await profileService.updateFullProfile(req.jugador.id, req.body);
    res.json({ message: 'Perfil actualizado.', jugador: jugadorActualizado });
  } catch (err) {
    next(err);
  }
};

const setOnlineStatus = async (req, res, next) => {
  try {
    const status = await profileService.updateOnlineStatus(req.jugador.id, req.body.is_online);
    res.json({ is_online: status });
  } catch (err) {
    next(err);
  }
};

const getAvatarOptions = async (req, res) => {
  const seed = req.jugador?.username || req.clerkUserId;
  res.json({ avatars: profileService.getAvatarOptions(seed) });
};

module.exports = { getProfile, updateProfile, getAvatarOptions, setOnlineStatus };