export function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 ${rounded} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
