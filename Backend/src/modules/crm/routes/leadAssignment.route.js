const express = require('express');
const ctrl = require('../controllers/leadAssignment.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/leadAssignment.validator');

const router = express.Router();

router.use(auth);

router.get('/', rbac('lead:read'), validate(v.list), ctrl.list);
router.post('/auto-run', rbac('lead:assign'), validate(v.autoRun), ctrl.autoRun);

module.exports = router;
