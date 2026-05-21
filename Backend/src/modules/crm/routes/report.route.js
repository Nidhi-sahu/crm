const express = require('express');
const ctrl = require('../controllers/report.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/report.validator');

const router = express.Router();

router.use(auth);
router.use(rbac('report:view'));

router.get('/conversion-funnel', validate(v.list), ctrl.conversionFunnel);
router.get('/source-analytics', validate(v.list), ctrl.sourceAnalytics);
router.get('/lost-reasons', validate(v.list), ctrl.lostReasons);
router.get('/avg-completion-time', validate(v.list), ctrl.avgCompletionTime);
router.get('/stage-delay', ctrl.stageDelay);
router.get('/salesperson-scorecard', validate(v.list), ctrl.salespersonScorecard);
router.get('/overdue-followups', validate(v.list), ctrl.overdueFollowups);

module.exports = router;
