const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const notificationService = require('../services/notification.service');
const { buildMeta } = require('../../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit, unread } = await notificationService.listForUser(req.user._id, req.query);
  ApiResponse.ok(res, items, 'Notifications fetched', { ...buildMeta({ page, limit, total }), unread });
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.unreadCount(req.user._id);
  ApiResponse.ok(res, { count }, 'Unread count');
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user._id);
  ApiResponse.ok(res, { notification }, 'Marked as read');
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  ApiResponse.ok(res, null, 'All notifications marked as read');
});

const remove = asyncHandler(async (req, res) => {
  await notificationService.remove(req.params.id, req.user._id);
  ApiResponse.ok(res, null, 'Notification deleted');
});

module.exports = { list, unreadCount, markRead, markAllRead, remove };
