import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Alert } from '../../../../shared/components/Alert';

// Official-style WhatsApp glyph.
const WhatsappGlyph = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.017-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const initials = (name = '') =>
  name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';

// Default confirmation message used at the "WhatsApp & Email Confirmation" stage.
const buildDefaultMessage = (lead) => {
  const name = lead?.enquiryId?.clientName || 'there';
  const project = lead?.project || lead?.enquiryId?.project || '';
  return (
    `Namaste ${name},\n\n` +
    `Thank you for your interest with Langdi Builders` +
    (project ? ` in ${project}` : '') +
    `. Our Sales Coordinator will connect with you shortly to confirm your site visit.\n\n` +
    `— Langdi Builders`
  );
};

export function WhatsappModal({ open, lead, onClose, onSent }) {
  const enquiry = lead?.enquiryId || {};
  const phone = (enquiry.clientPhone || '').trim();
  const clientName = enquiry.clientName || 'Lead';

  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setMessage(buildDefaultMessage(lead));
    setError('');
    setSaving(false);
  }, [open, lead]);

  if (!lead) return null;

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Message cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSent({ type: 'text', body: message.trim() });
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to send WhatsApp message.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send WhatsApp Message"
      subtitle="Sent from the business WhatsApp number"
      width="max-w-md"
      footer={
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400">{message.trim().length} chars</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleSend}
              disabled={saving || !phone}
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {saving ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {error && <Alert tone="error" title="Couldn't send">{error}</Alert>}

        {/* Recipient card */}
        <div className="flex items-center gap-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 px-3 py-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
            <WhatsappGlyph size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{clientName}</p>
            <p className="truncate text-xs text-slate-500">
              {phone ? phone : 'No phone number'}
            </p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#1ebe5d]">
            WhatsApp
          </span>
        </div>

        {!phone && (
          <Alert tone="warning" title="No phone number">
            This lead has no phone number to message.
          </Alert>
        )}

        {/* Message compose */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Message</label>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type the WhatsApp message…"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-[#25D366] focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
          />
        </div>

        <p className="flex items-start gap-1.5 text-[11px] text-slate-400">
          <span aria-hidden="true">💬</span>
          <span>
            Delivery &amp; read status will appear in the lead’s WhatsApp History. Proactive
            messages may need a Meta-approved template.
          </span>
        </p>
      </div>
    </Modal>
  );
}
