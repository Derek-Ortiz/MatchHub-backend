const { Router } = require('express');
const { body, query } = require('express-validator');
const { requireAuth, requireProfile } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/games.controller');

const router = Router();
router.use(requireAuth, requireProfile);

router.get('/', ctrl.listGames);

router.get(
  '/search',
  [
    query('q').trim().isLength({ min: 2 }).withMessage('Mínimo 2 caracteres.'),
    query('limit').optional().isInt({ min: 1, max: 20 }),
  ],
  validate,
  ctrl.searchGames
);

router.post(
  '/',
  [
    body('rawg_id').optional().isInt({ min: 1 }),
    body('nombre')
      .if((value, { req }) => !req.body.rawg_id)
      .trim()
      .isLength({ min: 1, max: 150 })
      .withMessage('nombre es requerido si no se proporciona rawg_id.'),
    body('plataformas').optional().isArray(),
  ],
  validate,
  ctrl.addGame
);

module.exports = router;
