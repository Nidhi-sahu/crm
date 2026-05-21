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

const apiRouter = require('./routes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(config.cookie.secret));
app.use(requestLogger);
app.use(rateLimit(rateLimitOptions));

app.use(config.apiPrefix, apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
