const express = require('express');
const ctrl = require('../controllers/broker.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const adminOnly = require('../../../middlewares/adminOnly.middleware');
const v = require('../validators/broker.validator');

const router = express.Router();
router.use(auth);

// List + view: any authenticated user, service filters by managedBy.
router.get('/', ctrl.list);
router.get('/:id', validate(v.byId), ctrl.getOne);
router.get('/:id/stats', validate(v.byId), ctrl.stats);
router.get('/:id/leads', validate(v.byId), ctrl.listLeads);

// Create + edit: Admin only.
router.post('/', adminOnly, validate(v.create), ctrl.create);
router.patch('/:id', adminOnly, validate(v.update), ctrl.update);

module.exports = router;
