const express = require('express');
const ctrl = require('../controllers/permission.controller');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');

const router = express.Router();

router.use(auth);

router.get('/', rbac('permission:read'), ctrl.list);

module.exports = router;
