const safeDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const userName = (u) => u?.name || u?.email || 'System';

const STATUS_LABELS = {
  pending: 'Qualification started (pending)',
  qualified: 'Marked as Qualified',
  rejected: 'Marked as Not Qualified',
  hold: 'Marked as Hold',
  futureProspect: 'Marked as Future Prospect',
};

export const buildTimeline = ({ enquiry, qualification }) => {
  const events = [];

  if (enquiry?.createdAt) {
    events.push({
      id: 'enquiry-created',
      verb: 'Enquiry created',
      actor: userName(enquiry.createdBy),
      at: enquiry.createdAt,
    });
  }

  if (
    enquiry?.updatedAt &&
    enquiry?.createdAt &&
    new Date(enquiry.updatedAt).getTime() - new Date(enquiry.createdAt).getTime() > 60 * 1000
  ) {
    events.push({
      id: 'enquiry-updated',
      verb: 'Enquiry updated',
      actor: userName(enquiry.updatedBy || enquiry.createdBy),
      at: enquiry.updatedAt,
    });
  }

  if (enquiry?.nextFollowupAt) {
    events.push({
      id: 'enquiry-followup',
      verb: `Followup scheduled for ${new Date(enquiry.nextFollowupAt).toLocaleDateString(
        'en-IN',
        { day: '2-digit', month: 'short', year: 'numeric' },
      )}`,
      actor: userName(enquiry.updatedBy || enquiry.createdBy),
      at: enquiry.updatedAt || enquiry.createdAt,
    });
  }

  if (qualification?._id) {
    events.push({
      id: 'qualification-created',
      verb: 'Qualification record created',
      actor: userName(qualification.createdBy),
      at: qualification.createdAt,
    });
    if (qualification.qualificationStatus && qualification.qualificationStatus !== 'pending') {
      events.push({
        id: 'qualification-status',
        verb: STATUS_LABELS[qualification.qualificationStatus] || `Status: ${qualification.qualificationStatus}`,
        actor: userName(qualification.qualifiedBy || qualification.updatedBy),
        at: qualification.qualifiedAt || qualification.updatedAt || qualification.createdAt,
      });
    }
    if (qualification.nextFollowupAt) {
      events.push({
        id: 'qualification-reminder',
        verb: `Reminder set for ${new Date(qualification.nextFollowupAt).toLocaleString(
          'en-IN',
          { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' },
        )}`,
        actor: userName(qualification.updatedBy || qualification.createdBy),
        at: qualification.updatedAt || qualification.createdAt,
      });
    }
  }

  return events
    .filter((e) => safeDate(e.at))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
};
