const { Router } = require('express');
const { body } = require('express-validator');
const { requireAuth, requireProfile } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/profile.controller');

const router = Router();
router.use(requireAuth, requireProfile);

const DIAS = [0, 1, 2, 3, 4, 5, 6];
const ESTILOS = ['casual', 'competitivo'];
const REGIONES = ['norte', 'centro', 'sur'];

router.get('/', ctrl.getProfile);

router.get('/avatars', ctrl.getAvatarOptions);

router.patch(
  '/online',
  [body('is_online').isBoolean().withMessage('is_online debe ser booleano.')],
  validate,
  ctrl.setOnlineStatus
);

router.put(
  '/',
  [
    body('username').optional().trim().isLength({ min: 3, max: 50 }),
    body('discord_id').optional().trim().isLength({ max: 30 }),
    body('descripcion').optional().trim().isLength({ max: 500 }),
    body('estilo_juego').optional().isIn(ESTILOS).withMessage(`Estilo: ${ESTILOS.join(', ')}`),
    body('region').optional().isIn(REGIONES).withMessage(`Región: ${REGIONES.join(', ')}`),
    body('plataformas').optional().isArray(),
    body('avatar_url').optional().isURL().withMessage('avatar_url debe ser una URL válida.'),
    body('videojuego_ids').optional().isArray(),
    body('videojuego_ids.*').optional().isInt({ min: 1 }),
    body('preferencia_ids').optional().isArray(),
    body('preferencia_ids.*').optional().isInt({ min: 1 }),
    body('disponibilidad').optional().isArray(),
    body('disponibilidad.*.dia_semana').optional().isIn(DIAS),
    body('disponibilidad.*.hora_inicio').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
    body('disponibilidad.*.hora_fin').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
  ],
  validate,
  ctrl.updateProfile
);

module.exports = router;
