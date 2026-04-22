const { Router } = require('express');
const { body } = require('express-validator');
const { requireAuth, requireProfile } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/matchRequests.controller');

const router = Router();
router.use(requireAuth, requireProfile);

router.post(
  '/',
  [
    body('receptor_id').isInt({ min: 1 }).withMessage('receptor_id es requerido.')
  ],
  validate,
  ctrl.sendRequest
);

router.get('/received', ctrl.getReceived);

router.get('/sent', ctrl.getSent);

router.put('/:id/accept', ctrl.acceptRequest);

router.put('/:id/reject', ctrl.rejectRequest);

router.delete('/:id', ctrl.cancelRequest);

module.exports = router;
