const reminderRepo = require('../modules/crm/repositories/reminder.repository');
const notificationService = require('../modules/crm/services/notification.service');
const logger = require('../utils/logger');
const { NOTIFICATION_TYPE } = require('../constants/notificationTypes');

const DAY_MS = 24 * 60 * 60 * 1000;

const run = async () => {
  const started = Date.now();
  const now = new Date();
  const since = new Date(now.getTime() - DAY_MS);

  // Overdue + still-pending items keep showing as pending/overdue (not "missed")
  // until the user completes them. Notify the assignee at most once per day.
  const overdue = await reminderRepo.findOverdueToNotify(now, since, 200);

  if (!overdue.length) {
    return { scanned: 0, notified: 0, durationMs: Date.now() - started };
  }

  let notified = 0;
  for (const r of overdue) {
    const created = await notificationService.notify({
      userId: r.assignedTo,
      type: NOTIFICATION_TYPE.REMINDER_OVERDUE,
      title: 'Overdue follow-up',
      body: r.title,
      referenceType: 'reminder',
      referenceId: r._id,
      meta: { reminderId: r._id, refType: r.referenceType, refId: r.referenceId },
    });
    if (created) notified += 1;
  }

  await reminderRepo.markOverdueNotifiedBulk(overdue.map((r) => r._id), now);

  const result = { scanned: overdue.length, notified, durationMs: Date.now() - started };
  logger.info('OverdueReminders job completed', result);
  return result;
};

module.exports = { run };
