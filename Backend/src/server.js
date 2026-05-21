const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./database/connect');
const cronScheduler = require('./cron');

const server = http.createServer(app);

const start = async () => {
  await connectDB();
  cronScheduler.start();
  server.listen(config.port, () => {
    logger.info(`Langdi CRM backend running on port ${config.port} (${config.env})`);
    logger.info(`Health: http://localhost:${config.port}${config.apiPrefix}/health`);
  });
};

const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down`);
  cronScheduler.stop();
  server.close(async () => {
    try {
      await disconnectDB();
    } catch (err) {
      logger.error('Error during DB disconnect', { err: err && err.message });
    }
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown — server did not close in 10s');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { err: err && err.message, stack: err && err.stack });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { err: err && err.message, stack: err && err.stack });
  process.exit(1);
});

start().catch((err) => {
  logger.error('Failed to start server', { err: err && err.message, stack: err && err.stack });
  process.exit(1);
});
