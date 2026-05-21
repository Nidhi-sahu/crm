import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';

export function QualificationModalStub({ open, enquiry, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start Qualification"
      subtitle={enquiry ? `For ${enquiry.clientName}` : ''}
      width="max-w-md"
      footer={
        <div className="flex items-center justify-end">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-3 py-2">
        <div className="rounded-xl border border-brand-200 bg-brand-100 p-4">
          <p className="text-sm font-semibold text-slate-900">Coming next</p>
          <p className="mt-1 text-xs text-slate-700">
            Dynamic qualification questions, Hot/Warm/Cold selector, comment, reminder and timeline
            will appear here in Phase B.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          The icon and wiring are ready — only the inside of this modal needs to be built.
        </p>
      </div>
    </Modal>
  );
}
