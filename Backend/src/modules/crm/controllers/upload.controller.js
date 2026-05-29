const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const ApiError = require('../../../utils/ApiError');

const visitPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const url = `${req.protocol}://${req.get('host')}/uploads/visit-photos/${req.file.filename}`;
  ApiResponse.created(res, { url, filename: req.file.filename }, 'Photo uploaded');
});

module.exports = { visitPhoto };
