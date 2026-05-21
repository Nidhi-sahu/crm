import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import {
  backendToUiStatus,
  uiStatusLabel,
  uiStatusTone,
} from '../constants/enquiryStatuses';
import { labelForClientType } from '../constants/clientTypes';
import { formatDate } from '../utils/enquiryFormatters';

const TONE_CLASSES = {
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-600',
};

const StatusChip = ({ status }) => {
  const ui = backendToUiStatus(status);
  const cls = TONE_CLASSES[uiStatusTone(ui)] || TONE_CLASSES.slate;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {uiStatusLabel(ui)}
    </span>
  );
};

const SectionTitle = ({ children }) => (
  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-600">
    {children}
  </p>
);

const Field = ({ label, value }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm text-slate-800 break-words">
      {value || <span className="text-slate-300">—</span>}
    </p>
  </div>
);

const SectionCard = ({ title, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4">
    <SectionTitle>{title}</SectionTitle>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
  </section>
);

const shortCode = (id, prefix) => {
  if (!id) return '';
  const tail = String(id).slice(-6).toUpperCase();
  return `${prefix}-${tail}`;
};

const fullDateTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function EnquiryDetailsModal({ open, enquiry, onClose }) {
  if (!enquiry) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enquiry Details"
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-end">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <SectionCard title="Basic Information">
          <Field label="Enquiry Number" value={shortCode(enquiry._id, 'ENQ')} />
          <Field
            label="Date of Enquiry"
            value={formatDate(enquiry.dateOfEnquiry || enquiry.createdAt)}
          />
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Status
            </p>
            <div className="pt-0.5">
              <StatusChip status={enquiry.status} />
            </div>
          </div>
          <Field label="Created By" value={enquiry.createdBy?.name} />
        </SectionCard>

        <SectionCard title="Client Information">
          <Field label="Client Name" value={enquiry.clientName} />
          <Field label="Company Name" value={enquiry.companyName} />
          <Field label="Phone Number" value={enquiry.clientPhone} />
          <Field label="Email Address" value={enquiry.clientEmail} />
          <Field label="Client Type" value={labelForClientType(enquiry.clientType)} />
          <Field label="Client ID" value={shortCode(enquiry._id, 'CL')} />
        </SectionCard>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle>Requirement Detail</SectionTitle>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {enquiry.requirement || (
              <span className="text-slate-300">No requirement details provided.</span>
            )}
          </p>
        </section>

        <SectionCard title="System Information">
          <Field label="Created On" value={fullDateTime(enquiry.createdAt)} />
        </SectionCard>
      </div>
    </Modal>
  );
}
