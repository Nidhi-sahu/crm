import { useState, useEffect } from 'react';
import { Button } from '../../../../shared/components/Button';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { STATUS_FILTER_OPTIONS } from '../constants/enquiryStatuses';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export function EnquiryFiltersBar({ filters, onPatch, onAdd, onBulkImport }) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 sm:max-w-md">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            onPatch({ search: e.target.value });
          }}
          placeholder="Search name, phone, email, project…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <div className="min-w-[150px]">
        <SelectInput
          options={STATUS_FILTER_OPTIONS}
          value={filters.uiStatus || ''}
          onChange={(e) => onPatch({ uiStatus: e.target.value })}
          className="!rounded-md !py-1 !pl-3 !pr-7 !text-xs"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={filters.activityDate || ''}
          onChange={(e) => onPatch({ activityDate: e.target.value })}
          title="Show enquiries with a follow-up on this date"
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        {filters.activityDate && (
          <button
            type="button"
            onClick={() => onPatch({ activityDate: '' })}
            title="Clear date"
            className="rounded-md px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {onBulkImport && (
          <button
            type="button"
            onClick={onBulkImport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V4m0 0L8 8m4-4 4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Bulk Import
          </button>
        )}
        {onAdd && (
          <Button
            variant="primary"
            onClick={onAdd}
            className="!gap-1.5 !rounded-md !px-2.5 !py-1 !text-xs"
          >
            Add Enquiry
          </Button>
        )}
      </div>
    </div>
  );
}
