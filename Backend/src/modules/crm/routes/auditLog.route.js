const express = require('express');
const ctrl = require('../controllers/auditLog.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/auditLog.validator');

const router = express.Router();

router.use(auth);
router.use(rbac('auditLog:read'));

router.get('/', validate(v.list), ctrl.list);
router.get('/:id', validate(v.byId), ctrl.getOne);

module.exports = router;
