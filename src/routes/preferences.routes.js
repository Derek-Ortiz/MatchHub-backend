const { Router } = require('express');
const { query } = require('express-validator');
const { requireAuth, requireProfile } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/preferences.controller');

const router = Router();
router.use(requireAuth, requireProfile);

router.get('/', ctrl.listPreferences);

router.get(
  '/compare',
  [query('other_id').isInt({ min: 1 }).withMessage('other_id debe ser un entero positivo.')],
  validate,
  ctrl.comparePreferences
);

module.exports = router;
