const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-+()]{6,19}$/;

const todayInputValue = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const enquiryRules = {
  clientName: {
    required: 'Client name is required',
    minLength: { value: 2, message: 'Minimum 2 characters' },
    maxLength: { value: 100, message: 'Maximum 100 characters' },
  },
  companyName: {
    maxLength: { value: 100, message: 'Maximum 100 characters' },
  },
  clientPhone: {
    required: 'Phone number is required',
    minLength: { value: 7, message: 'Minimum 7 digits' },
    maxLength: { value: 20, message: 'Maximum 20 characters' },
    pattern: { value: PHONE_RE, message: 'Enter a valid phone number' },
  },
  clientEmail: {
    validate: (v) => {
      if (!v) return true;
      return EMAIL_RE.test(v) ? true : 'Enter a valid email address';
    },
  },
  source: { required: 'Source is required' },
  requirement: { maxLength: { value: 500, message: 'Maximum 500 characters' } },
  remarks: { maxLength: { value: 2000, message: 'Maximum 2000 characters' } },
};

export const defaultEnquiryValues = {
  clientName: '',
  companyName: '',
  clientType: '',
  clientPhone: '',
  clientEmail: '',
  dateOfEnquiry: todayInputValue(),
  source: '',
  requirement: '',
  nextFollowupAt: '',
  remarks: '',
};

const isoToInputDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const enquiryToFormValues = (enquiry) => {
  if (!enquiry) return { ...defaultEnquiryValues };
  return {
    clientName: enquiry.clientName || '',
    companyName: enquiry.companyName || '',
    clientType: enquiry.clientType || '',
    clientPhone: enquiry.clientPhone || '',
    clientEmail: enquiry.clientEmail || '',
    dateOfEnquiry: isoToInputDate(enquiry.dateOfEnquiry) || todayInputValue(),
    source: enquiry.source || '',
    requirement: enquiry.requirement || '',
    nextFollowupAt: isoToInputDate(enquiry.nextFollowupAt),
    remarks: enquiry.remarks || '',
  };
};

export const formValuesToPayload = (values) => {
  const payload = {};
  const setIf = (k, v) => {
    if (v !== '' && v !== null && v !== undefined) payload[k] = v;
  };

  setIf('clientName', values.clientName?.trim());
  setIf('companyName', values.companyName?.trim());
  setIf('clientType', values.clientType);
  setIf('clientPhone', values.clientPhone?.trim());
  setIf('clientEmail', values.clientEmail?.trim());
  if (values.dateOfEnquiry) {
    payload.dateOfEnquiry = new Date(values.dateOfEnquiry).toISOString();
  }
  setIf('source', values.source);
  setIf('requirement', values.requirement?.trim());
  if (values.nextFollowupAt) {
    payload.nextFollowupAt = new Date(values.nextFollowupAt).toISOString();
  }
  setIf('remarks', values.remarks?.trim());

  return payload;
};
