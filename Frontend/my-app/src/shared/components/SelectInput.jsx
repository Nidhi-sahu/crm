import { forwardRef } from 'react';

export const SelectInput = forwardRef(function SelectInput(
  { label, id, error, options = [], placeholder, className = '', children, ...rest },
  ref,
) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={[
          'field-input appearance-none bg-[length:14px_14px] bg-[right_0.75rem_center] bg-no-repeat pr-9',
          error ? 'has-error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m6 9 6 6 6-6' stroke='%2364748B' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        }}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
});
