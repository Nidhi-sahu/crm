import { Spinner } from './Spinner';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
};

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const cls = `${VARIANTS[variant] || VARIANTS.primary} ${className}`.trim();
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cls}
      {...rest}
    >
      {loading && <Spinner size={16} className="text-current" />}
      <span>{children}</span>
    </button>
  );
}
