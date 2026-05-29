const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');
const VISIT_PHOTO_DIR = path.join(UPLOAD_ROOT, 'visit-photos');

fs.mkdirSync(VISIT_PHOTO_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VISIT_PHOTO_DIR),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname || '') || '.jpg').toLowerCase();
    cb(null, `visit-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const imageFilter = (_req, file, cb) => {
  if (/^image\//.test(file.mimetype)) cb(null, true);
  else cb(ApiError.badRequest('Only image files are allowed'), false);
};

const single = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('photo');

const handleVisitPhotoUpload = (req, res, next) => {
  single(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(
          ApiError.badRequest(
            err.code === 'LIMIT_FILE_SIZE' ? 'Image too large (max 5MB)' : err.message,
          ),
        );
      }
      return next(err);
    }
    return next();
  });
};

module.exports = { handleVisitPhotoUpload, UPLOAD_ROOT };
