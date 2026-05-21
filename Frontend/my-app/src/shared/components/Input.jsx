import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, id, error, leftIcon, rightSlot, className = '', ...rest },
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
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'field-input',
            leftIcon ? 'pl-10' : '',
            rightSlot ? 'pr-11' : '',
            error ? 'has-error' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        />
        {rightSlot && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightSlot}
          </span>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
});
