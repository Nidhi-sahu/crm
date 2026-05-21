const express = require('express');
const ctrl = require('../controllers/dashboard.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/dashboard.validator');

const router = express.Router();

router.use(auth);
router.use(rbac('dashboard:view'));

router.get('/overview', validate(v.list), ctrl.overview);
router.get('/stage-funnel', validate(v.list), ctrl.stageFunnel);
router.get('/salesperson-performance', validate(v.list), ctrl.salespersonPerformance);
router.get('/source-breakdown', validate(v.list), ctrl.sourceBreakdown);
router.get('/temperature-breakdown', validate(v.list), ctrl.temperatureBreakdown);
router.get('/negotiation-pipeline', validate(v.list), ctrl.negotiationPipeline);
router.get('/final-deals', validate(v.list), ctrl.finalDeals);
router.get('/enquiry-trends', validate(v.trends), ctrl.enquiryTrends);
router.get('/enquiry-status-breakdown', validate(v.list), ctrl.enquiryStatusBreakdown);

module.exports = router;
