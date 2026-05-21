const express = require('express');
const ctrl = require('../controllers/comment.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/comment.validator');

const router = express.Router();

router.use(auth);

router.post('/', rbac('comment:create'), validate(v.create), ctrl.create);
router.get('/', rbac('comment:read'), validate(v.list), ctrl.list);
router.get('/by-ref/:referenceType/:referenceId', rbac('comment:read'), validate(v.byRef), ctrl.getByRef);
router.get('/:id', rbac('comment:read'), validate(v.byId), ctrl.getOne);
router.delete('/:id', rbac('comment:create'), validate(v.byId), ctrl.remove);

module.exports = router;
