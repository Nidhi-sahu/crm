const express = require('express');
const ctrl = require('../controllers/auth.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const v = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', validate(v.login), ctrl.login);
router.post('/refresh', validate(v.refresh), ctrl.refresh);
router.post('/logout', validate(v.refresh), ctrl.logout);
router.post('/logout-all', auth, ctrl.logoutAll);
router.get('/me', auth, ctrl.me);
router.post('/forgot-password', validate(v.forgotPassword), ctrl.forgotPassword);
router.post('/reset-password', validate(v.resetPassword), ctrl.resetPassword);
router.post('/change-password', auth, validate(v.changePassword), ctrl.changePassword);

module.exports = router;
