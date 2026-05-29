const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const enquiryService = require('../services/enquiry.service');
const { buildMeta } = require('../../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.create(req.body, req.user);
  ApiResponse.created(res, { enquiry }, 'Enquiry created');
});

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await enquiryService.list(req.query);
  ApiResponse.ok(res, items, 'Enquiries fetched', buildMeta({ page, limit, total }));
});

const getOne = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.getById(req.params.id);
  ApiResponse.ok(res, { enquiry }, 'Enquiry fetched');
});

const update = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.update(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { enquiry }, 'Enquiry updated');
});

const setFollowup = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.setFollowup(req.params.id, req.body.nextFollowupAt, req.user);
  ApiResponse.ok(res, { enquiry }, 'Followup updated');
});

const remove = asyncHandler(async (req, res) => {
  await enquiryService.remove(req.params.id);
  ApiResponse.ok(res, null, 'Enquiry deleted');
});

const checkPhone = asyncHandler(async (req, res) => {
  const exists = await enquiryService.phoneExists(req.query.phone, req.query.excludeId);
  ApiResponse.ok(res, { exists }, 'Phone checked');
});

const bulkImport = asyncHandler(async (req, res) => {
  const result = await enquiryService.bulkImport(req.body, req.user);
  ApiResponse.created(res, result, 'Bulk import processed');
});

const bulkAssign = asyncHandler(async (req, res) => {
  const result = await enquiryService.bulkAssign(req.body, req.user);
  ApiResponse.ok(res, result, 'Leads distributed');
});

module.exports = {
  create,
  list,
  getOne,
  update,
  setFollowup,
  remove,
  checkPhone,
  bulkImport,
  bulkAssign,
};
