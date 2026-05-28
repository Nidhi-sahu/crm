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
  [ROLES.TELE_SALES]: [
    'dashboard:view',
    'enquiry:read',
    'qualification:read',
    'lead:read', 'lead:update', 'lead:moveStage',
    'leadStage:read',
    'comment:create', 'comment:read',
    'reminder:create', 'reminder:read', 'reminder:update', 'reminder:complete',
    'notification:read', 'notification:update',
  ],
  [ROLES.VISIT_TEAM]: [
    'dashboard:view',
    'enquiry:read',
    'qualification:read',
    'lead:read',
    'leadStage:read',
    'comment:read',
    'reminder:read',
    'notification:read', 'notification:update',
  ],
};

const STAGES_SEED = [
  {
    name: 'Call For Visit Confirmation By S/C',
    order: 1,
    color: '#3B82F6',
    description: 'Sales Co-ordinator calls the client to confirm the site visit',
    assignedRoles: [],
    requiredFields: [],
    slaHours: 24,
    isInitial: true,
    isSystem: true,
  },
  {
    name: 'Whatsapp & Email Confirmation Message to Clients By S/C',
    order: 2,
    color: '#06B6D4',
    description: 'Sales Co-ordinator sends WhatsApp & email confirmation to the client',
    assignedRoles: [],
    requiredFields: [],
    slaHours: 24,
    isSystem: true,
  },
  {
    name: 'Remind Call By Telesales',
    order: 3,
    color: '#8B5CF6',
    description: 'Telesales reminder call before the visit',
    assignedRoles: [],
    requiredFields: [],
    slaHours: 24,
    isSystem: true,
  },
  {
    name: 'Visit Confirmed',
    order: 4,
    color: '#10B981',
    description: 'Client has confirmed the property visit',
    assignedRoles: [],
    requiredFields: [],
    slaHours: 24,
    isSystem: true,
  },
  {
    name: 'Feedback Call by Sales Co-ordinator',
    order: 5,
    color: '#22C55E',
    description: 'Sales Co-ordinator collects feedback from the client',
    assignedRoles: [],
    requiredFields: [],
    slaHours: 24,
    isSystem: true,
  },
  {
    name: 'Follow-Up Call By Sales Person',
    order: 6,
    color: '#EF4444',
    description: 'Sales person follow-up call with the client',
    assignedRoles: [],
    requiredFields: [],
    slaHours: 48,
    isSystem: true,
  },
  {
    name: 'Call For Negotiation and Family Visit',
    order: 7,
    color: '#EC4899',
    description: 'Negotiation call and family visit coordination',
    assignedRoles: [],
    requiredFields: [],
    slaHours: 48,
    isSystem: true,
  },
  {
    name: 'Call For Final Deal',
    order: 8,
    color: '#F59E0B',
    description: 'Call with the client to push for the final deal',
    assignedRoles: [],
    requiredFields: [],
    slaHours: 48,
    isFinal: true,
    isSystem: true,
  },
];

const seedStages = async () => {
  logger.info('Seeding lead stages…');

  // Phase 1: shift existing stages to temp orders (1000+) to avoid unique-constraint
  // conflicts when reordering or renaming. Names are stable, so we'll match by name.
  const existing = await leadStageRepo.findAll();
  if (existing.length > 0) {
    await leadStageRepo.bulkReorder(
      existing.map((s, idx) => ({ id: s._id, order: 1000 + idx })),
    );
  }

  // Phase 2: upsert by NAME with final order + fields (preserves _id for existing
  // entries — existing leads' currentStageId references remain valid).
  // Strip `name` from data since the repository sets it via $setOnInsert
  // (can't be in both $set and $setOnInsert simultaneously).
  for (const stage of STAGES_SEED) {
    const { name, ...rest } = stage;
    await leadStageRepo.upsertByName(name, {
      ...rest,
      isInitial: !!stage.isInitial,
      isFinal: !!stage.isFinal,
      allowedNextStages: [],
    });
    logger.info(`  - ${name} (order ${stage.order})`);
  }

  // Phase 3: rebuild allowedNextStages based on the now-final order.
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
