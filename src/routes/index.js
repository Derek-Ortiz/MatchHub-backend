const { Router } = require('express');

const authRoutes         = require('./auth.routes');
const profileRoutes      = require('./profile.routes');
const playersRoutes      = require('./players.routes');
const gamesRoutes        = require('./games.routes');
const preferencesRoutes  = require('./preferences.routes');
const matchRequestRoutes = require('./matchRequests.routes');
const matchesRoutes      = require('./matches.routes');

const router = Router();

router.use('/auth',           authRoutes);
router.use('/profile',        profileRoutes);
router.use('/players',        playersRoutes);
router.use('/games',          gamesRoutes);
router.use('/preferences',    preferencesRoutes);
router.use('/match-requests', matchRequestRoutes);
router.use('/matches',        matchesRoutes);

module.exports = router;
