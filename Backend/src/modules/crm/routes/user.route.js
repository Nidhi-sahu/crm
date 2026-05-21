const express = require('express');
const ctrl = require('../controllers/user.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/user.validator');

const router = express.Router();

router.use(auth);

router.post('/', rbac('user:create'), validate(v.create), ctrl.create);
router.get('/', rbac('user:read'), validate(v.list), ctrl.list);
router.get('/:id', rbac('user:read'), validate(v.byId), ctrl.getOne);
router.patch('/:id', rbac('user:update'), validate(v.update), ctrl.update);
router.post('/:id/activate', rbac('user:update'), validate(v.byId), ctrl.activate);
router.post('/:id/deactivate', rbac('user:update'), validate(v.byId), ctrl.deactivate);
router.post('/:id/assign-role', rbac('user:assignRole'), validate(v.assignRole), ctrl.assignRole);
router.delete('/:id', rbac('user:delete'), validate(v.byId), ctrl.remove);

module.exports = router;
