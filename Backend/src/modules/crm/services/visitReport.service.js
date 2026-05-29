const visitReportRepo = require('../repositories/visitReport.repository');
const leadRepo = require('../repositories/lead.repository');
const ApiError = require('../../../utils/ApiError');

const create = async (leadId, data, actor) => {
  const lead = await leadRepo.findById(leadId);
  if (!lead) throw ApiError.notFound('Lead not found');

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
    customerBudget: data.customerBudget || '',
    customerProfession: data.customerProfession || '',
    customerAddress: data.customerAddress || '',
    sourceOfCustomer: data.sourceOfCustomer || '',
    seniorPerson: data.seniorPerson || '',
    visitNumber: data.visitNumber || '1st',
    photoUrl: data.photoUrl || '',
    createdBy: actor._id,
  });

  return report.toObject();
};

const listForLead = (leadId) => visitReportRepo.findByLeadId(leadId);

module.exports = { create, listForLead };
