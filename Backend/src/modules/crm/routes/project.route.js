const express = require('express');
const ctrl = require('../controllers/project.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/project.validator');

const router = express.Router();

router.use(auth);

router.get('/', rbac('project:read'), ctrl.list);
router.post('/', rbac('project:create'), validate(v.create), ctrl.create);
router.patch('/:id', rbac('project:update'), validate(v.update), ctrl.update);
router.delete('/:id', rbac('project:delete'), validate(v.byId), ctrl.remove);

module.exports = router;
