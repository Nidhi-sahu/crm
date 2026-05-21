const express = require('express');
const ctrl = require('../controllers/role.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/role.validator');

const router = express.Router();

router.use(auth);

router.post('/', rbac('role:create'), validate(v.create), ctrl.create);
router.get('/', rbac('role:read'), ctrl.list);
router.get('/:id', rbac('role:read'), validate(v.byId), ctrl.getOne);
router.patch('/:id', rbac('role:update'), validate(v.update), ctrl.update);
router.delete('/:id', rbac('role:delete'), validate(v.byId), ctrl.remove);

module.exports = router;
