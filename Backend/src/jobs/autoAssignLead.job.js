const leadAssignmentService = require('../modules/crm/services/leadAssignment.service');
const logger = require('../utils/logger');

const run = async (options = {}) => {
  const started = Date.now();
  const result = await leadAssignmentService.runAutoAssignSweep(options);
  const durationMs = Date.now() - started;

  logger.info('AutoAssignLead job completed', {
    scanned: result.scanned,
    assigned: result.assigned,
    skipped: result.skipped,
    durationMs,
  });

  return result;
};

module.exports = { run };
