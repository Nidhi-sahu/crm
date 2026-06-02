const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const corsOptions = require('./config/cors.config');
const rateLimitOptions = require('./config/ratelimit.config');

const requestLogger = require('./middlewares/requestLogger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { UPLOAD_ROOT } = require('./middlewares/upload.middleware');

const apiRouter = require('./routes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(
  express.json({
    limit: '1mb',
    // Keep the raw body so the WhatsApp webhook can verify Meta's HMAC signature.
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(config.cookie.secret));
app.use(requestLogger);
app.use(rateLimit(rateLimitOptions));

// Serve uploads with cross-origin headers so frontend can fetch/preview/download
// from a different origin (Vite dev server on :5173).
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(UPLOAD_ROOT),
);

app.use(config.apiPrefix, apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
