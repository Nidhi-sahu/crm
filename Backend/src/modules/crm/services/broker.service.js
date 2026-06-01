const mongoose = require('mongoose');
const User = require('../models/user.model');
const Enquiry = require('../models/enquiry.model');
const Lead = require('../models/lead.model');
const Role = require('../models/role.model');
const hashUtil = require('../../../utils/hash.util');
const ApiError = require('../../../utils/ApiError');
const ROLES = require('../../../constants/roles');

const isAdmin = (user) =>
  (user?.roleId?.name || user?.role?.name) === ROLES.ADMINISTRATOR;

const buildVisibilityFilter = (actor) => {
  if (isAdmin(actor)) return {};
  // Sales/Visit users see only brokers they manage.
  return {
    $or: [
      { managedBySalesId: actor._id },
      { managedByVisitId: actor._id },
    ],
  };
};

const list = async (actor) => {
  const role = await Role.findOne({ name: ROLES.BROKER }).lean();
  if (!role) return [];
  const filter = {
    roleId: role._id,
    status: 'active',
    ...buildVisibilityFilter(actor),
  };
  return User.find(filter)
    .select('name email phone managedBySalesId managedByVisitId createdAt lastLoginAt isLocked')
    .populate({ path: 'managedBySalesId', select: 'name email' })
    .populate({ path: 'managedByVisitId', select: 'name email' })
    .sort({ name: 1 })
    .lean();
};

const create = async (data, actor) => {
  // Only Admin can create brokers (gated at route level too)
  const role = await Role.findOne({ name: ROLES.BROKER });
  if (!role) throw ApiError.badRequest('Broker role missing — run seed first');

  const existing = await User.findOne({ email: data.email.toLowerCase() }).lean();
  if (existing) throw ApiError.conflict('Email already in use');

  const password = data.password || `Broker@${Math.random().toString(36).slice(-6)}`;
  const passwordHash = await hashUtil.hash(password);

  const created = await User.create({
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone ? data.phone.trim() : '',
    passwordHash,
    roleId: role._id,
    managedBySalesId: data.managedBySalesId || null,
    managedByVisitId: data.managedByVisitId || null,
    status: 'active',
  });

  return { broker: created.toJSON(), tempPassword: password };
};

const getById = async (id, actor) => {
  const broker = await User.findById(id)
    .populate({ path: 'managedBySalesId', select: 'name email' })
    .populate({ path: 'managedByVisitId', select: 'name email' })
    .lean();
  if (!broker) throw ApiError.notFound('Broker not found');
  // Visibility: admin or managers only.
  if (!isAdmin(actor)) {
    const okSales =
      broker.managedBySalesId &&
      String(broker.managedBySalesId._id || broker.managedBySalesId) === String(actor._id);
    const okVisit =
      broker.managedByVisitId &&
      String(broker.managedByVisitId._id || broker.managedByVisitId) === String(actor._id);
    if (!okSales && !okVisit) throw ApiError.forbidden('Not allowed to view this broker');
  }
  return broker;
};

const update = async (id, data, actor) => {
  await getById(id, actor); // permission check
  const $set = {};
  if (data.name !== undefined) $set.name = data.name.trim();
  if (data.phone !== undefined) $set.phone = data.phone.trim();
  if (data.managedBySalesId !== undefined) $set.managedBySalesId = data.managedBySalesId || null;
  if (data.managedByVisitId !== undefined) $set.managedByVisitId = data.managedByVisitId || null;
  return User.findByIdAndUpdate(id, { $set }, { new: true })
    .populate({ path: 'managedBySalesId', select: 'name email' })
    .populate({ path: 'managedByVisitId', select: 'name email' })
    .lean();
};

const stats = async (id, actor) => {
  const broker = await getById(id, actor); // visibility check
  const brokerObjId = new mongoose.Types.ObjectId(broker._id);

  // Find enquiries linked to this broker (by brokerId; legacy by brokerName fallback).
  const enquiries = await Enquiry.find({
    $or: [{ brokerId: brokerObjId }, { brokerName: broker.name }],
  })
    .select('_id project')
    .lean();

  const totalEnquiries = enquiries.length;
  const enquiryIds = enquiries.map((e) => e._id);

  const leads = await Lead.find({ enquiryId: { $in: enquiryIds } })
    .select('_id project status')
    .lean();

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'won').length;
  const activeLeads = leads.filter((l) => l.status === 'active').length;
  const lostLeads = leads.filter((l) => ['lost', 'dropped'].includes(l.status)).length;

  // Project-wise lead count
  const projectBuckets = {};
  for (const e of enquiries) {
    const key = (e.project || 'Unassigned').trim() || 'Unassigned';
    projectBuckets[key] = projectBuckets[key] || { enquiries: 0, leads: 0 };
    projectBuckets[key].enquiries += 1;
  }
  const enquiryById = Object.fromEntries(enquiries.map((e) => [String(e._id), e]));
  for (const l of leads) {
    const enq = enquiryById[String(l.enquiryId)];
    const key = (l.project || enq?.project || 'Unassigned').trim() || 'Unassigned';
    projectBuckets[key] = projectBuckets[key] || { enquiries: 0, leads: 0 };
    projectBuckets[key].leads += 1;
  }
  const projects = Object.entries(projectBuckets)
    .map(([name, v]) => ({ name, enquiries: v.enquiries, leads: v.leads }))
    .sort((a, b) => b.leads - a.leads);

  return {
    brokerId: broker._id,
    brokerName: broker.name,
    totals: {
      enquiries: totalEnquiries,
      leads: totalLeads,
      active: activeLeads,
      won: wonLeads,
      lost: lostLeads,
    },
    projects,
  };
};

const listLeads = async (id, actor) => {
  const broker = await getById(id, actor);
  const enquiries = await Enquiry.find({
    $or: [{ brokerId: broker._id }, { brokerName: broker.name }],
  })
    .select('_id')
    .lean();
  const enquiryIds = enquiries.map((e) => e._id);
  return Lead.find({ enquiryId: { $in: enquiryIds } })
    .populate({ path: 'enquiryId', select: 'clientName clientPhone clientEmail project' })
    .populate({ path: 'currentStageId', select: 'name order' })
    .populate({ path: 'assignedTo', select: 'name email' })
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = { list, create, getById, update, stats, listLeads };
