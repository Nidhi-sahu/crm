const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const commentService = require('../services/comment.service');
const { buildMeta } = require('../../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const comment = await commentService.create(req.body, req.user);
  ApiResponse.created(res, { comment }, 'Comment added');
});

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await commentService.list(req.query);
  ApiResponse.ok(res, items, 'Comments fetched', buildMeta({ page, limit, total }));
});

const getByRef = asyncHandler(async (req, res) => {
  const comments = await commentService.getByRef(req.params.referenceType, req.params.referenceId);
  ApiResponse.ok(res, comments, 'Comments fetched');
});

const getOne = asyncHandler(async (req, res) => {
  const comment = await commentService.getById(req.params.id);
  ApiResponse.ok(res, { comment }, 'Comment fetched');
});

const remove = asyncHandler(async (req, res) => {
  await commentService.remove(req.params.id, req.user);
  ApiResponse.ok(res, null, 'Comment deleted');
});

module.exports = { create, list, getByRef, getOne, remove };
