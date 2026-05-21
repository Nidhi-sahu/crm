/* Sample data seed — sales persons + enquiries.
 * Idempotent: skips records that already exist (by email / phone).
 * Run with: npm run seed:sample
 * Requires `npm run seed` to have run first (roles + admin must exist).
 */
const logger = require('../utils/logger');
const { connectDB, disconnectDB } = require('./connect');
const roleRepo = require('../modules/crm/repositories/role.repository');
const userRepo = require('../modules/crm/repositories/user.repository');
const Enquiry = require('../modules/crm/models/enquiry.model');
const hashUtil = require('../utils/hash.util');
const ROLES = require('../constants/roles');

const SALES_PASSWORD = 'Sales@1234';

const SALES_PERSONS = [
  { name: 'Amit Sharma', email: 'amit.sharma@langdi.local', phone: '9810000001' },
  { name: 'Neha Gupta', email: 'neha.gupta@langdi.local', phone: '9810000002' },
  { name: 'Vikram Patel', email: 'vikram.patel@langdi.local', phone: '9810000003' },
];

const ENQUIRIES = [
  {
    clientName: 'Rahul Jain',
    clientPhone: '9876500001',
    clientEmail: 'rahul.jain@gmail.com',
    companyName: 'ABC Corp',
    clientType: 'individual',
    source: 'website',
    requirement: 'Looking for a 2BHK in the central area, ready to move.',
  },
  {
    clientName: 'Priya Mehta',
    clientPhone: '9876500002',
    clientEmail: 'priya.mehta@gmail.com',
    companyName: '',
    clientType: 'individual',
    source: 'reference',
    requirement: '3BHK villa with parking, possession within 3 months.',
  },
  {
    clientName: 'Vikram Singh',
    clientPhone: '9876500003',
    clientEmail: 'vikram.singh@gmail.com',
    companyName: 'Singh Traders',
    clientType: 'company',
    source: 'googleAds',
    requirement: 'Commercial space around 2000 sq ft for a showroom.',
  },
  {
    clientName: 'Anjali Verma',
    clientPhone: '9876500004',
    clientEmail: 'anjali.verma@gmail.com',
    companyName: '',
    clientType: 'individual',
    source: 'instagram',
    requirement: 'Residential plot near the highway, investment purpose.',
  },
  {
    clientName: 'Sandeep Roy',
    clientPhone: '9876500005',
    clientEmail: 'sandeep.roy@gmail.com',
    companyName: 'Roy Industries',
    clientType: 'company',
    source: 'walkIn',
    requirement: 'Office space, budget flexible, prefers a prime location.',
  },
  {
    clientName: 'Kavita Nair',
    clientPhone: '9876500006',
    clientEmail: 'kavita.nair@gmail.com',
    companyName: '',
    clientType: 'individual',
    source: 'facebook',
    requirement: '1BHK as an investment property, low maintenance.',
  },
];

const run = async () => {
  await connectDB();

  const spRole = await roleRepo.findByName(ROLES.SALES_PERSON);
  if (!spRole) {
    throw new Error('Sales Person role not found — run `npm run seed` first.');
  }

  logger.info('Seeding sample sales persons…');
  const passwordHash = await hashUtil.hash(SALES_PASSWORD);
  let spCreated = 0;
  for (const sp of SALES_PERSONS) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await userRepo.findByEmailLean(sp.email);
    if (exists) {
      logger.info(`  - exists: ${sp.email}`);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await userRepo.create({
        name: sp.name,
        email: sp.email,
        phone: sp.phone,
        passwordHash,
        roleId: spRole._id,
        additionalRoleIds: [],
        additionalPermissions: [],
        managerId: null,
        status: 'active',
      });
      spCreated += 1;
      logger.info(`  - created sales person: ${sp.name}`);
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@langdi.local';
  const admin = await userRepo.findByEmailLean(adminEmail);
  if (!admin) {
    throw new Error('Admin user not found — run `npm run seed` first.');
  }

  logger.info('Seeding sample enquiries…');
  let enqCreated = 0;
  for (const e of ENQUIRIES) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Enquiry.findOne({ clientPhone: e.clientPhone }).lean();
    if (exists) {
      logger.info(`  - exists: enquiry for ${e.clientName}`);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await Enquiry.create({
        ...e,
        dateOfEnquiry: new Date(),
        createdBy: admin._id,
      });
      enqCreated += 1;
      logger.info(`  - created enquiry: ${e.clientName}`);
    }
  }

  logger.warn('=========================================');
  logger.warn(` Sample seed done — ${spCreated} sales person(s), ${enqCreated} enquiry(s)`);
  if (spCreated > 0) {
    logger.warn(` Sales person login password: ${SALES_PASSWORD}`);
  }
  logger.warn('=========================================');

  await disconnectDB();
  logger.info('Sample seed complete.');
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Sample seed failed', { err: err && err.message, stack: err && err.stack });
    process.exit(1);
  });
