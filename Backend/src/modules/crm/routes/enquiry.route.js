const express = require('express');
const ctrl = require('../controllers/enquiry.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/enquiry.validator');

const router = express.Router();

router.use(auth);

router.post('/', rbac('enquiry:create'), validate(v.create), ctrl.create);
router.post('/bulk-import', rbac('enquiry:create'), validate(v.bulkImport), ctrl.bulkImport);
router.post('/bulk-assign', rbac('enquiry:update'), validate(v.bulkAssign), ctrl.bulkAssign);
router.get('/', rbac('enquiry:read'), validate(v.list), ctrl.list);
router.get('/check-phone', rbac('enquiry:read'), validate(v.checkPhone), ctrl.checkPhone);
router.get('/:id', rbac('enquiry:read'), validate(v.byId), ctrl.getOne);
router.patch('/:id', rbac('enquiry:update'), validate(v.update), ctrl.update);
router.post('/:id/followup', rbac('enquiry:update'), validate(v.setFollowup), ctrl.setFollowup);
router.delete('/:id', rbac('enquiry:delete'), validate(v.byId), ctrl.remove);

module.exports = router;
