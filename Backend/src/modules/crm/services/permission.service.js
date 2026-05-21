const permissionRepo = require('../repositories/permission.repository');

const list = (filter = {}) => permissionRepo.findAll(filter);

module.exports = { list };
