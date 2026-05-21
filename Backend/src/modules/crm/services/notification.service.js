const notificationRepo = require('../repositories/notification.repository');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const logger = require('../../../utils/logger');

const notify = async ({ userId, type, title, body = '', referenceType = null, referenceId = null, meta = {} }) => {
  if (!userId) return null;
  try {
    return await notificationRepo.create({ userId, type, title, body, referenceType, referenceId, meta });
  } catch (err) {
    logger.warn('Failed to create notification', { err: err && err.message, userId, type });
    return null;
  }
};

const notifyMany = async (userIds, payload) => {
  const unique = Array.from(new Set((userIds || []).filter(Boolean).map((u) => String(u))));
  if (!unique.length) return [];
  const items = unique.map((userId) => ({ ...payload, userId }));
  try {
    return await notificationRepo.createMany(items);
  } catch (err) {
    logger.warn('Failed to create notifications batch', { err: err && err.message });
    return [];
  }
};

const listForUser = async (userId, query) => {
  const { page = 1, limit = 20, unreadOnly, type } = query || {};
  const filter = {};
  if (unreadOnly === true || unreadOnly === 'true') filter.isRead = false;
  if (type) filter.type = type;
  const skip = buildSkip({ page, limit });
  const [items, total, unread] = await Promise.all([
    notificationRepo.findForUser({ userId, filter, skip, limit: Number(limit) }),
    notificationRepo.countForUser(userId, filter),
    notificationRepo.countUnread(userId),
  ]);
  return { items, total, page: Number(page), limit: Number(limit), unread };
};

const unreadCount = (userId) => notificationRepo.countUnread(userId);

const markRead = async (id, userId) => {
  const updated = await notificationRepo.markRead(id, userId);
  if (!updated) throw ApiError.notFound('Notification not found');
  return updated;
};

const markAllRead = (userId) => notificationRepo.markAllReadForUser(userId);

const remove = async (id, userId) => {
  const deleted = await notificationRepo.remove(id, userId);
  if (!deleted) throw ApiError.notFound('Notification not found');
};

module.exports = { notify, notifyMany, listForUser, unreadCount, markRead, markAllRead, remove };
