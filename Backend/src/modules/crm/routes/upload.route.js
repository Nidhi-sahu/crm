const express = require('express');
const ctrl = require('../controllers/upload.controller');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const { handleVisitPhotoUpload } = require('../../../middlewares/upload.middleware');

const router = express.Router();

router.use(auth);

router.post('/visit-photo', rbac('lead:update'), handleVisitPhotoUpload, ctrl.visitPhoto);

module.exports = router;
