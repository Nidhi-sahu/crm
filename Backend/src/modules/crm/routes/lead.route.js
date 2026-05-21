const express = require('express');
const ctrl = require('../controllers/lead.controller');
const assignCtrl = require('../controllers/leadAssignment.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/lead.validator');
const av = require('../validators/leadAssignment.validator');

const router = express.Router();

router.use(auth);

router.post('/from-enquiry/:enquiryId', rbac('lead:create'), validate(v.fromEnquiry), ctrl.createFromEnquiry);

router.get('/', rbac('lead:read'), validate(v.list), ctrl.list);
router.get('/:id', rbac('lead:read'), validate(v.byId), ctrl.getOne);
router.get('/:id/history', rbac('lead:read'), validate(v.byId), ctrl.getHistory);
router.get('/:id/assignments', rbac('lead:read'), validate(av.byId), assignCtrl.getHistory);

router.patch('/:id', rbac('lead:update'), validate(v.update), ctrl.update);

router.post('/:id/move-stage', rbac('lead:moveStage'), validate(v.moveStage), ctrl.moveStage);
router.post('/:id/undo-stage', rbac('lead:moveStage'), validate(v.byId), ctrl.undoStage);

router.post('/:id/assign', rbac('lead:assign'), validate(av.assign), assignCtrl.assign);
router.post('/:id/unassign', rbac('lead:assign'), validate(av.unassign), assignCtrl.unassign);

router.post('/:id/mark-won', rbac('lead:update'), validate(v.byId), ctrl.markWon);
router.post('/:id/mark-lost', rbac('lead:update'), validate(v.markLost), ctrl.markLost);
router.post('/:id/mark-dropped', rbac('lead:update'), validate(v.markDropped), ctrl.markDropped);

router.delete('/:id', rbac('lead:delete'), validate(v.byId), ctrl.remove);

module.exports = router;
