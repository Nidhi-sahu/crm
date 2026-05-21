const logger = require('../utils/logger');
const { connectDB, disconnectDB } = require('./connect');
const permissionRepo = require('../modules/crm/repositories/permission.repository');
const roleRepo = require('../modules/crm/repositories/role.repository');
const userRepo = require('../modules/crm/repositories/user.repository');
const leadStageRepo = require('../modules/crm/repositories/leadStage.repository');
const hashUtil = require('../utils/hash.util');
const { PERMISSION_CATALOG } = require('../constants/permissions');
const ROLES = require('../constants/roles');

const allKeys = PERMISSION_CATALOG.map((p) => p.key);

const rolePermissions = {
  [ROLES.ADMINISTRATOR]: allKeys,
  [ROLES.SALES_COORDINATOR]: [
    'dashboard:view', 'dashboard:export',
    'user:read',
    'enquiry:create', 'enquiry:read', 'enquiry:update',
    'qualification:create', 'qualification:read', 'qualification:update',
    'lead:read', 'lead:update', 'lead:assign', 'lead:moveStage',
    'leadStage:read',
    'comment:create', 'comment:read',
    'reminder:create', 'reminder:read', 'reminder:update', 'reminder:complete',
    'report:view', 'report:export',
    'notification:read', 'notification:update',
  ],
  [ROLES.SALES_PERSON]: [
    'dashboard:view',
    'enquiry:read',
    'qualification:read',
    'lead:read', 'lead:update', 'lead:moveStage',
    'leadStage:read',
    'comment:create', 'comment:read',
    'reminder:create', 'reminder:read', 'reminder:update', 'reminder:complete',
    'notification:read', 'notification:update',
  ],
  [ROLES.LEAD_GENERATOR]: [
    'dashboard:view',
    'enquiry:create', 'enquiry:read', 'enquiry:update',
    'qualification:create', 'qualification:read',
    'lead:create',
    'leadStage:read',
    'comment:create', 'comment:read',
    'reminder:create', 'reminder:read',
    'notification:read', 'notification:update',
  ],
};

const STAGES_SEED = [
  {
    name: 'Visit Scheduling',
    order: 1,
    color: '#3B82F6',
    description: 'Schedule and arrange the property visit with client',
    assignedRoles: [ROLES.ADMINISTRATOR, ROLES.SALES_COORDINATOR],
    requiredFields: [],
    slaHours: 24,
    isInitial: true,
    isSystem: true,
  },
  {
    name: 'Reminder Call',
    order: 2,
    color: '#8B5CF6',
    description: 'Follow-up reminder call before visit',
    assignedRoles: [ROLES.ADMINISTRATOR, ROLES.SALES_COORDINATOR, ROLES.SALES_PERSON],
    requiredFields: [],
    slaHours: 24,
    isSystem: true,
  },
  {
    name: 'Visit Completed',
    order: 3,
    color: '#10B981',
    description: 'Property visit completed by client',
    assignedRoles: [ROLES.ADMINISTRATOR, ROLES.SALES_COORDINATOR, ROLES.SALES_PERSON],
    requiredFields: [],
    slaHours: 48,
    isSystem: true,
  },
  {
    name: 'Feedback Call',
    order: 4,
    color: '#F59E0B',
    description: 'Post-visit feedback from client',
    assignedRoles: [ROLES.ADMINISTRATOR, ROLES.SALES_PERSON],
    requiredFields: [],
    slaHours: 24,
    isSystem: true,
  },
  {
    name: 'Follow-Up',
    order: 5,
    color: '#EC4899',
    description: 'Continued engagement and follow-ups',
    assignedRoles: [ROLES.ADMINISTRATOR, ROLES.SALES_PERSON],
    requiredFields: [],
    slaHours: 48,
    isSystem: true,
  },
  {
    name: 'Negotiation',
    order: 6,
    color: '#EF4444',
    description: 'Price and terms negotiation',
    assignedRoles: [ROLES.ADMINISTRATOR, ROLES.SALES_COORDINATOR, ROLES.SALES_PERSON],
    requiredFields: [],
    slaHours: 72,
    isSystem: true,
  },
  {
    name: 'Final Deal',
    order: 7,
    color: '#22C55E',
    description: 'Deal closed — booking/sale confirmed',
    assignedRoles: [ROLES.ADMINISTRATOR, ROLES.SALES_COORDINATOR],
    requiredFields: [],
    slaHours: 168,
    isFinal: true,
    isSystem: true,
  },
];

const seedStages = async () => {
  logger.info('Seeding lead stages…');

  for (const stage of STAGES_SEED) {
    await leadStageRepo.upsertByOrder(stage.order, { ...stage, allowedNextStages: [] });
    logger.info(`  - ${stage.name} (order ${stage.order})`);
  }

  const all = await leadStageRepo.findAll();
  const byOrder = Object.fromEntries(all.map((s) => [s.order, s]));

  for (const s of all) {
    const nexts = [];
    const forward = byOrder[s.order + 1];
    const back = byOrder[s.order - 1];
    if (forward) nexts.push(forward._id);
    if (back) nexts.push(back._id);
    await leadStageRepo.update(s._id, { allowedNextStages: nexts });
  }

  logger.info(`Lead stages seeded: ${all.length}`);
};

const seed = async () => {
  await connectDB();

  logger.info('Seeding permissions catalog…');
  await permissionRepo.upsertMany(PERMISSION_CATALOG);
  const allPerms = await permissionRepo.findAll();
  logger.info(`Permissions seeded: ${allPerms.length}`);

  logger.info('Seeding default roles…');
  for (const [name, perms] of Object.entries(rolePermissions)) {
    await roleRepo.upsertByName(name, {
      description: `Default ${name} role`,
      permissions: perms,
      isSystem: true,
    });
    logger.info(`  - ${name}: ${perms.length} permissions`);
  }

  const adminRole = await roleRepo.findByName(ROLES.ADMINISTRATOR);
  if (!adminRole) throw new Error('Administrator role missing after seed');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@langdi.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const existing = await userRepo.findByEmailLean(adminEmail);
  if (existing) {
    logger.info(`Admin user already exists: ${adminEmail}`);
  } else {
    const passwordHash = await hashUtil.hash(adminPassword);
    await userRepo.create({
      name: 'Administrator',
      email: adminEmail,
      phone: '',
      passwordHash,
      roleId: adminRole._id,
      additionalPermissions: [],
      managerId: null,
      status: 'active',
    });
    logger.warn('=========================================');
    logger.warn(' Admin user created');
    logger.warn(` email:    ${adminEmail}`);
    logger.warn(` password: ${adminPassword}`);
    logger.warn(' Change this password immediately!');
    logger.warn('=========================================');
  }

  await seedStages();

  await disconnectDB();
  logger.info('Seed complete.');
};

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Seed failed', { err: err && err.message, stack: err && err.stack });
    process.exit(1);
  });
