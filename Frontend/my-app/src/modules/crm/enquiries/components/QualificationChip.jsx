import { qualificationLabel, qualificationTone } from '../constants/enquiryStatuses';

const TONE_CLASSES = {
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-600',
};

export function QualificationChip({ status }) {
  const tone = qualificationTone(status);
  const cls = TONE_CLASSES[tone] || TONE_CLASSES.slate;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {qualificationLabel(status)}
    </span>
  );
}
