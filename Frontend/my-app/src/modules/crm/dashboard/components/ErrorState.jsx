import { Button } from '../../../../shared/components/Button';

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="16" r="0.9" fill="currentColor" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-700">Couldn&apos;t load this section</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="ghost" onClick={onRetry} className="mt-3 !px-3 !py-1.5 text-xs">
          Try again
        </Button>
      )}
    </div>
  );
}
