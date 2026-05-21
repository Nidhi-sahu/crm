export function EnquiryEmptyState({ filtersActive, onReset, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3v-7.5A8.5 8.5 0 1 1 21 11.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-800">
        {filtersActive ? 'No enquiries match these filters' : 'No enquiries yet'}
      </p>
      <p className="mt-1 max-w-md text-xs text-slate-500">
        {filtersActive
          ? 'Try clearing or changing the filters above.'
          : 'Capture your first enquiry — leads start their journey here.'}
      </p>
      <div className="mt-4 flex gap-2">
        {filtersActive ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
          >
            Add Enquiry
          </button>
        )}
      </div>
    </div>
  );
}
