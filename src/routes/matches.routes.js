const { Router } = require('express');
const { requireAuth, requireProfile } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/matches.controller');

const router = Router();
router.use(requireAuth, requireProfile);

router.get('/stats', ctrl.getStats);

router.get('/', ctrl.listMatches);

router.get('/:id', ctrl.getMatch);

module.exports = router;
