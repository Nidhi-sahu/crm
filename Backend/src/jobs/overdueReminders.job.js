const reminderRepo = require('../modules/crm/repositories/reminder.repository');
const notificationService = require('../modules/crm/services/notification.service');
const logger = require('../utils/logger');
const { NOTIFICATION_TYPE } = require('../constants/notificationTypes');

const run = async () => {
  const started = Date.now();
  const now = new Date();

  const overdue = await reminderRepo.findOverduePending(now, 200);

  if (!overdue.length) {
    return { scanned: 0, marked: 0, notified: 0, durationMs: Date.now() - started };
  }

  const ids = overdue.map((r) => r._id);
  await reminderRepo.markMissedBulk(ids);

  let notified = 0;
  for (const r of overdue) {
    const created = await notificationService.notify({
      userId: r.assignedTo,
      type: NOTIFICATION_TYPE.REMINDER_OVERDUE,
      title: 'Reminder overdue',
      body: r.title,
      referenceType: 'reminder',
      referenceId: r._id,
      meta: { reminderId: r._id, refType: r.referenceType, refId: r.referenceId },
    });
    if (created) notified += 1;
  }

  const result = { scanned: overdue.length, marked: overdue.length, notified, durationMs: Date.now() - started };
  logger.info('OverdueReminders job completed', result);
  return result;
};

module.exports = { run };
