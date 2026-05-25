import { useState, useCallback } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { EnquiryForm } from './EnquiryForm';

const FORM_ID = 'enquiry-form';

export function EnquiryFormModal({
  open,
  mode = 'create',
  enquiry = null,
  saving = false,
  serverError,
  onClose,
  onSubmit,
}) {
  const [dirty, setDirty] = useState(false);

  const requestClose = useCallback(() => {
    if (saving) return;
    if (dirty) {
      // eslint-disable-next-line no-alert
      const ok = window.confirm('Discard unsaved changes?');
      if (!ok) return;
    }
    onClose?.();
  }, [dirty, onClose, saving]);

  const isEdit = mode === 'edit';

  return (
    <Modal
      open={open}
      onClose={requestClose}
      width="max-w-2xl"
      title={isEdit ? 'Edit Enquiry' : 'New Enquiry'}
      subtitle={
        isEdit
          ? 'Update enquiry details.'
          : 'Capture a client enquiry — qualification queue starts here.'
      }
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={requestClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID} loading={saving} disabled={saving}>
            {isEdit ? 'Save Changes' : 'Create Enquiry'}
          </Button>
        </div>
      }
    >
      <EnquiryForm
        formId={FORM_ID}
        initialEnquiry={isEdit ? enquiry : null}
        serverError={serverError}
        onDirtyChange={setDirty}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
