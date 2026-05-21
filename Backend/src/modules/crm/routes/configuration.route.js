const express = require('express');
const ctrl = require('../controllers/configuration.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/configuration.validator');

const router = express.Router();

router.use(auth);

router.get('/', rbac('configuration:read'), validate(v.list), ctrl.list);
router.post('/bulk', rbac('configuration:update'), validate(v.bulkSet), ctrl.bulkSet);
router.get('/:key', rbac('configuration:read'), validate(v.byKey), ctrl.getByKey);
router.put('/:key', rbac('configuration:update'), validate(v.set), ctrl.set);
router.delete('/:key', rbac('configuration:update'), validate(v.byKey), ctrl.remove);

module.exports = router;
