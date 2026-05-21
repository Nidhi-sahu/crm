const cron = require('node-cron');
const config = require('../config');
const logger = require('../utils/logger');
const schedules = require('./schedules');

const tasks = [];

const start = () => {
  if (!config.cron.enabled) {
    logger.info('Cron disabled via CRON_ENABLED=false');
    return;
  }

  for (const sched of schedules) {
    if (!cron.validate(sched.expression)) {
      logger.error(`Invalid cron expression for ${sched.name}: ${sched.expression}`);
      continue;
    }
    const task = cron.schedule(sched.expression, async () => {
      try {
        logger.info(`Cron started: ${sched.name}`);
        const result = await sched.run();
        logger.info(`Cron finished: ${sched.name}`, { result });
      } catch (err) {
        logger.error(`Cron failed: ${sched.name}`, { err: err && err.message, stack: err && err.stack });
      }
    });
    tasks.push({ name: sched.name, task });
    logger.info(`Cron scheduled: ${sched.name} (${sched.expression})`);
  }
};

const stop = () => {
  for (const { name, task } of tasks) {
    try {
      task.stop();
      logger.info(`Cron stopped: ${name}`);
    } catch (err) {
      logger.warn(`Failed to stop cron ${name}`, { err: err && err.message });
    }
  }
  tasks.length = 0;
};

module.exports = { start, stop };
