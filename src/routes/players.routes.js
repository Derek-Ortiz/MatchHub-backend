const { Router } = require('express');
const { query } = require('express-validator');
const { requireAuth, requireProfile } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/players.controller');

const router = Router();
router.use(requireAuth, requireProfile);

router.get(
  '/compatible',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  ctrl.getCompatible
);

router.get(
  '/',
  [
    query('region').optional().isIn(['norte', 'centro', 'sur']),
    query('estilo_juego').optional().isIn(['casual', 'competitivo']),
    query('plataforma').optional().isString(),
    query('videojuego_id').optional().isInt({ min: 1 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  ctrl.listPlayers
);

router.get('/:id', ctrl.getPlayerById);

module.exports = router;
