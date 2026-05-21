const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const qualificationService = require('../services/qualification.service');
const { buildMeta } = require('../../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const qualification = await qualificationService.create(req.body, req.user);
  ApiResponse.created(res, { qualification }, 'Qualification created');
});

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await qualificationService.list(req.query);
  ApiResponse.ok(res, items, 'Qualifications fetched', buildMeta({ page, limit, total }));
});

const getOne = asyncHandler(async (req, res) => {
  const qualification = await qualificationService.getById(req.params.id);
  ApiResponse.ok(res, { qualification }, 'Qualification fetched');
});

const getByEnquiry = asyncHandler(async (req, res) => {
  const qualification = await qualificationService.getByEnquiry(req.params.enquiryId);
  ApiResponse.ok(res, { qualification }, 'Qualification fetched');
});

const update = asyncHandler(async (req, res) => {
  const qualification = await qualificationService.update(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { qualification }, 'Qualification updated');
});

const qualify = asyncHandler(async (req, res) => {
  const qualification = await qualificationService.qualify(req.params.id, req.user);
  ApiResponse.ok(res, { qualification }, 'Enquiry qualified');
});

const reject = asyncHandler(async (req, res) => {
  const qualification = await qualificationService.reject(req.params.id, req.body.reason, req.user);
  ApiResponse.ok(res, { qualification }, 'Enquiry rejected');
});

const hold = asyncHandler(async (req, res) => {
  const qualification = await qualificationService.hold(
    req.params.id,
    { holdUntil: req.body.holdUntil, remarks: req.body.remarks },
    req.user
  );
  ApiResponse.ok(res, { qualification }, 'Enquiry on hold');
});

const futureProspect = asyncHandler(async (req, res) => {
  const qualification = await qualificationService.futureProspect(req.params.id, req.user);
  ApiResponse.ok(res, { qualification }, 'Marked as future prospect');
});

module.exports = { create, list, getOne, getByEnquiry, update, qualify, reject, hold, futureProspect };
