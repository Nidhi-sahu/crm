import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { Textarea } from '../../../../shared/components/Textarea';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Alert } from '../../../../shared/components/Alert';

const STATUS_OPTIONS = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: '', label: '— Select —' },
  { value: 'Savings', label: 'Savings' },
  { value: 'Current', label: 'Current' },
];

const buildInitial = (project) => ({
  name: project?.name || '',
  location: project?.location || '',
  propertyType: project?.propertyType || '',
  status: project?.status || 'ongoing',
  description: project?.description || '',
  bankDetails: {
    bankName: project?.bankDetails?.bankName || '',
    accountHolderName: project?.bankDetails?.accountHolderName || '',
    accountNumber: project?.bankDetails?.accountNumber || '',
    ifscCode: project?.bankDetails?.ifscCode || '',
    branch: project?.bankDetails?.branch || '',
    accountType: project?.bankDetails?.accountType || '',
    upiId: project?.bankDetails?.upiId || '',
  },
});

export function ProjectFormModal({ open, project, saving, saveError, onClose, onSubmit }) {
  const [form, setForm] = useState(() => buildInitial(project));
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(buildInitial(project));
      setError('');
    }
  }, [open, project]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setBank = (key) => (e) =>
    setForm((f) => ({ ...f, bankDetails: { ...f.bankDetails, [key]: e.target.value } }));

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError('Project name is required');
      return;
    }
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Add Project'}
      subtitle="Company project — visible to all users"
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
            disabled={saving}
            className="!gap-1.5 !rounded-md !px-4 !py-1.5 !text-xs"
          >
            {project ? 'Save Changes' : 'Add Project'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {(error || saveError?.message) && (
          <Alert tone="error" title="Couldn't save">{error || saveError.message}</Alert>
        )}
        <Input label="Project Name *" value={form.name} onChange={set('name')} placeholder="e.g. Skyline Towers" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Location" value={form.location} onChange={set('location')} placeholder="e.g. Pune" />
          <Input label="Property Type" value={form.propertyType} onChange={set('propertyType')} placeholder="e.g. Residential" />
        </div>
        <SelectInput label="Status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
        <Textarea label="Description" rows={3} value={form.description} onChange={set('description')} />

        <div className="pt-3">
          <div className="mb-2 flex items-center gap-2 border-t border-slate-100 pt-3">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Bank Account Details
            </p>
            <span className="text-[10px] text-slate-400">
              (shown when this project is selected during qualification)
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Bank Name"
              value={form.bankDetails.bankName}
              onChange={setBank('bankName')}
              placeholder="e.g. HDFC Bank"
            />
            <Input
              label="Account Holder Name"
              value={form.bankDetails.accountHolderName}
              onChange={setBank('accountHolderName')}
              placeholder="e.g. Langdi Developers Pvt Ltd"
            />
            <Input
              label="Account Number"
              value={form.bankDetails.accountNumber}
              onChange={setBank('accountNumber')}
              placeholder="e.g. 1234 5678 9012"
            />
            <Input
              label="IFSC Code"
              value={form.bankDetails.ifscCode}
              onChange={setBank('ifscCode')}
              placeholder="e.g. HDFC0001234"
            />
            <Input
              label="Branch"
              value={form.bankDetails.branch}
              onChange={setBank('branch')}
              placeholder="e.g. Andheri West"
            />
            <SelectInput
              label="Account Type"
              options={ACCOUNT_TYPE_OPTIONS}
              value={form.bankDetails.accountType}
              onChange={setBank('accountType')}
            />
            <div className="sm:col-span-2">
              <Input
                label="UPI ID (optional)"
                value={form.bankDetails.upiId}
                onChange={setBank('upiId')}
                placeholder="e.g. langdi@hdfcbank"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
