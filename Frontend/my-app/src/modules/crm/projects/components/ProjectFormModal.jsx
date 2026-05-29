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

const buildInitial = (project) => ({
  name: project?.name || '',
  location: project?.location || '',
  propertyType: project?.propertyType || '',
  status: project?.status || 'ongoing',
  description: project?.description || '',
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
      width="max-w-lg"
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
      </div>
    </Modal>
  );
}
