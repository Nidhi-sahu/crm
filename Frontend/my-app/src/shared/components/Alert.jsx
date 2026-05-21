const TONES = {
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-brand-100 text-slate-800 border-brand-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function Alert({ tone = 'info', title, children, className = '' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-3.5 py-3 text-sm ${TONES[tone] || TONES.info} ${className}`.trim()}
    >
      {title && <p className="font-medium">{title}</p>}
      {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
    </div>
  );
}
