const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const reminderService = require('../services/reminder.service');
const { buildMeta } = require('../../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const reminder = await reminderService.create(req.body, req.user);
  ApiResponse.created(res, { reminder }, 'Reminder created');
});

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await reminderService.list(req.query);
  ApiResponse.ok(res, items, 'Reminders fetched', buildMeta({ page, limit, total }));
});

const today = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await reminderService.today(req.user._id, req.query);
  ApiResponse.ok(res, items, "Today's reminders", buildMeta({ page, limit, total }));
});

const overdue = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await reminderService.overdue(req.user._id, req.query);
  ApiResponse.ok(res, items, 'Overdue reminders', buildMeta({ page, limit, total }));
});

const missed = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await reminderService.missed(req.user._id, req.query);
  ApiResponse.ok(res, items, 'Missed reminders', buildMeta({ page, limit, total }));
});

const getOne = asyncHandler(async (req, res) => {
  const reminder = await reminderService.getById(req.params.id);
  ApiResponse.ok(res, { reminder }, 'Reminder fetched');
});

const update = asyncHandler(async (req, res) => {
  const reminder = await reminderService.update(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { reminder }, 'Reminder updated');
});

const complete = asyncHandler(async (req, res) => {
  const reminder = await reminderService.complete(req.params.id, req.user);
  ApiResponse.ok(res, { reminder }, 'Reminder completed');
});

const cancel = asyncHandler(async (req, res) => {
  const reminder = await reminderService.cancel(req.params.id);
  ApiResponse.ok(res, { reminder }, 'Reminder cancelled');
});

const remove = asyncHandler(async (req, res) => {
  await reminderService.remove(req.params.id);
  ApiResponse.ok(res, null, 'Reminder deleted');
});

module.exports = { create, list, today, overdue, missed, getOne, update, complete, cancel, remove };
