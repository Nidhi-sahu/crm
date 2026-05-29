import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { Textarea } from '../../../../shared/components/Textarea';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Alert } from '../../../../shared/components/Alert';
import { leadsService } from '../services/leadsService';

const VISIT_NUMBER_OPTIONS = [
  { value: '1st', label: '1st Visit' },
  { value: '2nd', label: '2nd Visit' },
  { value: '3rd', label: '3rd Visit' },
  { value: '4th+', label: '4th+ Visit' },
];

const SectionHeader = ({ children }) => (
  <div className="flex items-center gap-2">
    <span className="h-3.5 w-1 rounded-full bg-brand-500" aria-hidden="true" />
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{children}</h3>
  </div>
);

const REQUIRED_FIELDS = {
  customerName: 'Customer Name',
  contactNumber: 'Contact Number',
  visitorName: 'Visitor Name',
  projectVisited: 'Project Visited',
  propertyInterested: 'Property Interested In',
  customerBudget: 'Customer Budget',
  seniorPerson: 'Senior Person',
};

const buildInitial = (lead) => {
  const e = lead?.enquiryId || {};
  const budget = e.budgetMax || e.budgetMin || lead?.budget || '';
  return {
    customerName: e.clientName || '',
    contactNumber: e.clientPhone || '',
    salesPersonName: lead?.assignedTo?.name || '',
    visitorName: '',
    projectVisited: e.project || lead?.project || '',
    propertyInterested: e.propertyType || lead?.propertyType || '',
    customerBudget: budget ? String(budget) : '',
    customerProfession: '',
    customerAddress: '',
    sourceOfCustomer: e.source || lead?.source || '',
    seniorPerson: '',
    visitNumber: '1st',
    photoUrl: '',
  };
};

export function VisitReportModal({ open, lead, nextStage, saving, saveError, onClose, onSubmit }) {
  const [form, setForm] = useState(() => buildInitial(lead));
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(buildInitial(lead));
      setErrors({});
      setPhotoError('');
      setUploading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?._id]);

  const set = (key) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => (er[key] ? { ...er, [key]: undefined } : er));
  };

  const handleSubmit = () => {
    const errs = {};
    Object.entries(REQUIRED_FIELDS).forEach(([key, label]) => {
      if (!String(form[key] || '').trim()) errs[key] = `${label} is required`;
    });
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setPhotoError('');
    try {
      const url = await leadsService.uploadVisitPhoto(file);
      setForm((f) => ({ ...f, photoUrl: url }));
    } catch (_) {
      setPhotoError('Upload failed. Try a smaller image (max 5MB).');
    } finally {
      setUploading(false);
    }
  };

  if (!lead) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Visit Report"
      subtitle={
        nextStage
          ? `Fill the visit details to move this lead to "${nextStage.name}"`
          : 'Fill the visit details'
      }
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={saving}
            disabled={saving || uploading}
            className="!gap-1.5 !rounded-md !px-4 !py-1.5 !text-xs"
          >
            Save &amp; Move Stage
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {saveError?.message && (
          <Alert tone="error" title="Couldn't save">{saveError.message}</Alert>
        )}

        {/* Customer details */}
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <SectionHeader>Customer Details</SectionHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Customer Name *" value={form.customerName} onChange={set('customerName')} error={errors.customerName} />
            <Input label="Contact Number *" value={form.contactNumber} onChange={set('contactNumber')} error={errors.contactNumber} />
            <Input label="Customer Budget *" value={form.customerBudget} onChange={set('customerBudget')} error={errors.customerBudget} />
            <Input label="Customer Profession" value={form.customerProfession} onChange={set('customerProfession')} />
            <Input label="Source of Customer" value={form.sourceOfCustomer} onChange={set('sourceOfCustomer')} />
            <Input label="Property Interested In *" value={form.propertyInterested} onChange={set('propertyInterested')} error={errors.propertyInterested} />
          </div>
          <Textarea
            label="Customer Address"
            rows={2}
            value={form.customerAddress}
            onChange={set('customerAddress')}
          />
        </section>

        {/* Visit details */}
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <SectionHeader>Visit Details</SectionHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Sales Person Name" value={form.salesPersonName} onChange={set('salesPersonName')} />
            <Input label="Visitor Name *" value={form.visitorName} onChange={set('visitorName')} error={errors.visitorName} />
            <Input label="Project Visited *" value={form.projectVisited} onChange={set('projectVisited')} error={errors.projectVisited} />
            <Input label="Senior Person (conducted visit) *" value={form.seniorPerson} onChange={set('seniorPerson')} error={errors.seniorPerson} />
            <SelectInput
              label="Number of Visit"
              options={VISIT_NUMBER_OPTIONS}
              value={form.visitNumber}
              onChange={set('visitNumber')}
            />
          </div>
        </section>

        {/* Photo with customer */}
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <SectionHeader>Photo with Customer on Site</SectionHeader>
          {form.photoUrl ? (
            <div className="flex items-center gap-3">
              <img
                src={form.photoUrl}
                alt="Visit"
                className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, photoUrl: '' }))}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center hover:border-brand-400 hover:bg-brand-50">
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" disabled={uploading} />
              <span className="text-xs font-medium text-slate-600">
                {uploading ? 'Uploading…' : 'Click to upload a photo'}
              </span>
              <span className="text-[11px] text-slate-400">JPG / PNG — max 5MB</span>
            </label>
          )}
          {photoError && <p className="text-[11px] font-medium text-rose-600">{photoError}</p>}
        </section>

        <p className="text-[11px] text-slate-400 text-center">Timestamp is recorded automatically on save.</p>
      </div>
    </Modal>
  );
}
