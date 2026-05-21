const express = require('express');
const ctrl = require('../controllers/leadStage.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/leadStage.validator');

const router = express.Router();

router.use(auth);

router.get('/', rbac('leadStage:read'), ctrl.list);
router.post('/', rbac('leadStage:create'), validate(v.create), ctrl.create);
router.patch('/reorder', rbac('leadStage:update'), validate(v.reorder), ctrl.reorder);
router.put('/bulk', rbac('leadStage:update'), validate(v.bulkSync), ctrl.bulkSync);
router.get('/:id', rbac('leadStage:read'), validate(v.byId), ctrl.getOne);
router.patch('/:id', rbac('leadStage:update'), validate(v.update), ctrl.update);
router.post('/:id/activate', rbac('leadStage:update'), validate(v.byId), ctrl.activate);
router.post('/:id/deactivate', rbac('leadStage:update'), validate(v.byId), ctrl.deactivate);
router.delete('/:id', rbac('leadStage:delete'), validate(v.byId), ctrl.remove);

module.exports = router;
