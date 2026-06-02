const visitReportRepo = require('../repositories/visitReport.repository');
const leadRepo = require('../repositories/lead.repository');
const configRepo = require('../repositories/configuration.repository');
const Project = require('../models/project.model');
const ApiError = require('../../../utils/ApiError');
const { checkWithinAllowed } = require('../../../utils/geo.util');

const OFFICE_LOCATION_KEY = 'office.location';
const DEFAULT_RADIUS_M = 100;

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);

// Build the list of allowed locations (office + the lead's project site) and
// validate the submitted GPS position against them with an accuracy margin.
const verifyGeo = async (lead, data) => {
  // Resolve office location from configuration.
  let office = null;
  let radiusM = DEFAULT_RADIUS_M;
  try {
    const cfg = await configRepo.findByKey(OFFICE_LOCATION_KEY);
    const v = cfg && cfg.value;
    if (v && isNum(v.latitude) && isNum(v.longitude)) {
      office = { name: 'Office', lat: v.latitude, lng: v.longitude };
    }
    if (v && isNum(v.radiusMeters) && v.radiusMeters > 0) radiusM = v.radiusMeters;
  } catch (_) {
    office = null;
  }

  // Resolve the project/site location from SERVER-TRUSTED data only — never the
  // client-supplied data.projectVisited (a user near any project could otherwise
  // submit that project's name and pass the fence for a lead that isn't theirs).
  let site = null;
  const projectName =
    (lead.project && String(lead.project).trim()) ||
    (lead.enquiryId && lead.enquiryId.project && String(lead.enquiryId.project).trim()) ||
    '';
  if (projectName) {
    const project = await Project.findOne({ name: projectName }).lean();
    if (project && isNum(project.latitude) && isNum(project.longitude)) {
      site = { name: `Site: ${project.name}`, lat: project.latitude, lng: project.longitude };
    }
  }

  const allowed = [office, site].filter(Boolean);

  // No locations configured yet — cannot enforce; allow but record as unverified.
  if (allowed.length === 0) {
    return {
      submittedLat: isNum(data.latitude) ? data.latitude : null,
      submittedLng: isNum(data.longitude) ? data.longitude : null,
      submittedAccuracy: isNum(data.accuracy) ? data.accuracy : null,
      geoVerified: false,
      geoDistanceMeters: null,
      geoMatchedLocation: 'no-locations-configured',
    };
  }

  // Locations configured → position is mandatory (covers permission-denied case).
  if (!isNum(data.latitude) || !isNum(data.longitude)) {
    throw ApiError.forbidden(
      'Location access is required to submit a visit form. Please enable location and try again.',
    );
  }

  const result = checkWithinAllowed(
    { lat: data.latitude, lng: data.longitude, accuracy: data.accuracy },
    allowed,
    radiusM,
  );

  if (!result.verified) {
    throw ApiError.forbidden(
      `You must be at the site or office to submit a visit form. ` +
        `You are about ${result.distanceMeters}m from the nearest allowed location ` +
        `(${result.nearest}); allowed radius is ~${result.effectiveRadiusM}m.`,
    );
  }

  return {
    submittedLat: data.latitude,
    submittedLng: data.longitude,
    submittedAccuracy: isNum(data.accuracy) ? data.accuracy : null,
    geoVerified: true,
    geoDistanceMeters: result.distanceMeters,
    geoMatchedLocation: result.matched,
  };
};

const create = async (leadId, data, actor) => {
  const lead = await leadRepo.findById(leadId);
  if (!lead) throw ApiError.notFound('Lead not found');

  const geo = await verifyGeo(lead, data);

  const report = await visitReportRepo.create({
    leadId,
    enquiryId: (lead.enquiryId && (lead.enquiryId._id || lead.enquiryId)) || null,
    visitedAt: data.visitedAt ? new Date(data.visitedAt) : new Date(),
    customerName: data.customerName || '',
    contactNumber: data.contactNumber || '',
    salesPersonName: data.salesPersonName || '',
    visitorName: data.visitorName || '',
    projectVisited: data.projectVisited || '',
    propertyInterested: data.propertyInterested || '',
    firstPreference: data.firstPreference || '',
    secondPreference: data.secondPreference || '',
    customerBudget: data.customerBudget || '',
    customerProfession: data.customerProfession || '',
    customerAddress: data.customerAddress || '',
    sourceOfCustomer: data.sourceOfCustomer || '',
    seniorPerson: data.seniorPerson || '',
    visitNumber: data.visitNumber || '1st',
    photoUrl: data.photoUrl || '',
    ...geo,
    createdBy: actor._id,
  });

  return report.toObject();
};

const listForLead = (leadId) => visitReportRepo.findByLeadId(leadId);

module.exports = { create, listForLead };
