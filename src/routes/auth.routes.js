const { Router } = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/auth.controller');

const router = Router();

router.post(
  '/check-username',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Solo letras, números, _ y -.'),
  ],
  validate,
  ctrl.checkUsername
);

router.post(
  '/register',
  requireAuth,
  [
    body('username').optional().trim().isLength({ min: 3, max: 50 }),
    body('discord_id').optional().trim().isLength({ max: 30 }),
  ],
  validate,
  ctrl.register
);

router.get('/me', requireAuth, ctrl.me);

module.exports = router;