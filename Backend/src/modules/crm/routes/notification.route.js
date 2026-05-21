const express = require('express');
const ctrl = require('../controllers/notification.controller');
const validate = require('../../../middlewares/validate.middleware');
const auth = require('../../../middlewares/auth.middleware');
const rbac = require('../../../middlewares/rbac.middleware');
const v = require('../validators/notification.validator');

const router = express.Router();

router.use(auth);

router.get('/', rbac('notification:read'), validate(v.list), ctrl.list);
router.get('/unread-count', rbac('notification:read'), ctrl.unreadCount);
router.post('/mark-all-read', rbac('notification:update'), ctrl.markAllRead);
router.post('/:id/mark-read', rbac('notification:update'), validate(v.byId), ctrl.markRead);
router.delete('/:id', rbac('notification:update'), validate(v.byId), ctrl.remove);

module.exports = router;
