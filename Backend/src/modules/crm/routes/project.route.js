const express = require('express');
const ctrl = require('../controllers/project.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const adminOnly = require('../../../middlewares/adminOnly.middleware');
const v = require('../validators/project.validator');

const router = express.Router();

router.use(auth);

// All logged-in users can view ongoing projects.
router.get('/', ctrl.list);

// Only Admin manages projects.
router.post('/', adminOnly, validate(v.create), ctrl.create);
router.patch('/:id', adminOnly, validate(v.update), ctrl.update);
router.delete('/:id', adminOnly, validate(v.byId), ctrl.remove);

module.exports = router;
