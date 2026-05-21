import { forwardRef } from 'react';

export const Checkbox = forwardRef(function Checkbox(
  { label, id, className = '', ...rest },
  ref,
) {
  const inputId = id || rest.name;
  return (
    <label
      htmlFor={inputId}
      className={`inline-flex cursor-pointer select-none items-center gap-2 text-sm text-slate-700 ${className}`.trim()}
    >
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-brand-200"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
});
