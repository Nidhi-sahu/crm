const express = require('express');
const ctrl = require('../controllers/reminder.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/reminder.validator');

const router = express.Router();

router.use(auth);

router.post('/', rbac('reminder:create'), validate(v.create), ctrl.create);
router.get('/', rbac('reminder:read'), validate(v.list), ctrl.list);
router.get('/today', rbac('reminder:read'), validate(v.scopedList), ctrl.today);
router.get('/overdue', rbac('reminder:read'), validate(v.scopedList), ctrl.overdue);
router.get('/missed', rbac('reminder:read'), validate(v.scopedList), ctrl.missed);
router.get('/:id', rbac('reminder:read'), validate(v.byId), ctrl.getOne);
router.patch('/:id', rbac('reminder:update'), validate(v.update), ctrl.update);
router.post('/:id/complete', rbac('reminder:complete'), validate(v.byId), ctrl.complete);
router.post('/:id/cancel', rbac('reminder:update'), validate(v.byId), ctrl.cancel);
router.delete('/:id', rbac('reminder:update'), validate(v.byId), ctrl.remove);

module.exports = router;
