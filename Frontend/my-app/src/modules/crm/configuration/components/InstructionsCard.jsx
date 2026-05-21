import { STEP_INSTRUCTIONS } from '../constants/defaultStages';

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="8" r="0.9" fill="currentColor" />
  </svg>
);

export function InstructionsCard() {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-brand-700">
        <InfoIcon />
        <p className="text-sm font-semibold">Instructions</p>
      </div>
      <ul className="space-y-1.5">
        {STEP_INSTRUCTIONS.map((text) => (
          <li key={text} className="flex gap-2 text-xs text-slate-600">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
