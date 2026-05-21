import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  { label, id, error, rows = 3, className = '', ...rest },
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
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={[
          'field-input resize-y',
          error ? 'has-error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
});
