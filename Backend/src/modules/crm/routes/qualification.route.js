const express = require('express');
const ctrl = require('../controllers/qualification.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/qualification.validator');

const router = express.Router();

router.use(auth);

router.post('/', rbac('qualification:create'), validate(v.create), ctrl.create);
router.get('/', rbac('qualification:read'), validate(v.list), ctrl.list);
router.get('/by-enquiry/:enquiryId', rbac('qualification:read'), validate(v.byEnquiry), ctrl.getByEnquiry);
router.get('/:id', rbac('qualification:read'), validate(v.byId), ctrl.getOne);
router.patch('/:id', rbac('qualification:update'), validate(v.update), ctrl.update);
router.post('/:id/qualify', rbac('qualification:update'), validate(v.byId), ctrl.qualify);
router.post('/:id/reject', rbac('qualification:update'), validate(v.reject), ctrl.reject);
router.post('/:id/hold', rbac('qualification:update'), validate(v.hold), ctrl.hold);
router.post('/:id/future-prospect', rbac('qualification:update'), validate(v.byId), ctrl.futureProspect);

module.exports = router;
