import { TEMPERATURE_OPTIONS } from '../constants/qualificationStatuses';

export function TemperatureSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {TEMPERATURE_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              'flex flex-col items-start rounded-xl border p-3 text-left transition-all',
              active
                ? `border-transparent ring-2 ${opt.selectedRing} ${opt.bg}`
                : 'border-slate-200 bg-white hover:border-brand-200',
            ].join(' ')}
          >
            <span className={`text-sm font-semibold ${active ? opt.text : 'text-slate-800'}`}>
              {opt.label}
            </span>
            <span className="mt-0.5 text-[11px] text-slate-500">{opt.description}</span>
          </button>
        );
      })}
    </div>
  );
}
