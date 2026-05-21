const config = require('../config');
const autoAssignJob = require('../jobs/autoAssignLead.job');
const overdueRemindersJob = require('../jobs/overdueReminders.job');

const schedules = [
  {
    name: 'autoAssignLead',
    expression: config.cron.autoAssignExpression,
    run: () => autoAssignJob.run(),
  },
  {
    name: 'overdueReminders',
    expression: config.cron.overdueReminderExpression,
    run: () => overdueRemindersJob.run(),
  },
];

module.exports = schedules;
