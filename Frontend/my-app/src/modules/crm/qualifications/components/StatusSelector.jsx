import { STATUS_OPTIONS } from '../constants/qualificationStatuses';

const TONE_BG = {
  emerald: 'bg-emerald-50',
  rose: 'bg-rose-50',
  amber: 'bg-amber-50',
  brand: 'bg-brand-100',
};
const TONE_TEXT = {
  emerald: 'text-emerald-700',
  rose: 'text-rose-700',
  amber: 'text-amber-700',
  brand: 'text-brand-700',
};
const TONE_RING = {
  emerald: 'ring-emerald-400',
  rose: 'ring-rose-400',
  amber: 'ring-amber-400',
  brand: 'ring-brand-400',
};

export function StatusSelector({ value, onChange, error }) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {STATUS_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                'flex flex-col items-start rounded-xl border p-3 text-left transition-all',
                active
                  ? `border-transparent ring-2 ${TONE_RING[opt.tone]} ${TONE_BG[opt.tone]}`
                  : 'border-slate-200 bg-white hover:border-brand-200',
              ].join(' ')}
            >
              <span
                className={`text-sm font-semibold ${
                  active ? TONE_TEXT[opt.tone] : 'text-slate-800'
                }`}
              >
                {opt.label}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-500">{opt.description}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
