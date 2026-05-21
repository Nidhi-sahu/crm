const express = require('express');

const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const roleRoutes = require('./routes/role.route');
const permissionRoutes = require('./routes/permission.route');
const enquiryRoutes = require('./routes/enquiry.route');
const qualificationRoutes = require('./routes/qualification.route');
const leadStageRoutes = require('./routes/leadStage.route');
const leadRoutes = require('./routes/lead.route');
const leadAssignmentRoutes = require('./routes/leadAssignment.route');
const commentRoutes = require('./routes/comment.route');
const reminderRoutes = require('./routes/reminder.route');
const notificationRoutes = require('./routes/notification.route');
const dashboardRoutes = require('./routes/dashboard.route');
const reportRoutes = require('./routes/report.route');
const configurationRoutes = require('./routes/configuration.route');
const auditLogRoutes = require('./routes/auditLog.route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/qualifications', qualificationRoutes);
router.use('/lead-stages', leadStageRoutes);
router.use('/leads', leadRoutes);
router.use('/lead-assignments', leadAssignmentRoutes);
router.use('/comments', commentRoutes);
router.use('/reminders', reminderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/configurations', configurationRoutes);
router.use('/audit-logs', auditLogRoutes);

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Langdi CRM',
    data: {
      phase: 'phase-8-complete',
      mountedModules: [
        'auth', 'users', 'roles', 'permissions',
        'enquiries', 'qualifications',
        'lead-stages', 'leads', 'lead-assignments',
        'comments', 'reminders', 'notifications',
        'dashboard', 'reports',
        'configurations', 'audit-logs',
      ],
      pendingModules: [],
    },
  });
});

module.exports = router;
