import { useEffect, useState } from 'react';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { STATUS_FILTER_OPTIONS } from '../constants/leadStatuses';
import { ColumnSelector } from './ColumnSelector';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export function LeadsFiltersBar({
  filters,
  stages,
  onPatch,
  visibleKeys,
  onToggleColumn,
  onResetColumns,
}) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const stageOptions = [
    { value: '', label: 'All Stages' },
    ...stages.map((s) => ({ value: s._id, label: s.name })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[180px] flex-1">
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
          placeholder="Search client, phone, email…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <div className="w-40 shrink-0">
        <SelectInput
          options={STATUS_FILTER_OPTIONS}
          value={filters.uiStatus || ''}
          onChange={(e) => onPatch({ uiStatus: e.target.value })}
          className="!w-full !rounded-lg !py-2 !pl-3 !pr-8 !text-sm"
        />
      </div>

      <div className="w-48 shrink-0">
        <SelectInput
          options={stageOptions}
          value={filters.stageId || ''}
          onChange={(e) => onPatch({ stageId: e.target.value })}
          className="!w-full !truncate !rounded-lg !py-2 !pl-3 !pr-8 !text-sm"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <input
          type="date"
          value={filters.activityDate || ''}
          onChange={(e) => onPatch({ activityDate: e.target.value })}
          title="Show leads with a visit / follow-up / activity on this date"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
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

      <div className="shrink-0">
        <ColumnSelector
          visibleKeys={visibleKeys}
          onToggle={onToggleColumn}
          onReset={onResetColumns}
        />
      </div>
    </div>
  );
}
