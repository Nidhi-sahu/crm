import { useEffect, useState } from 'react';
import { Button } from '../../../../shared/components/Button';
import { ColumnSelector } from './ColumnSelector';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export function UsersFiltersBar({
  search,
  onSearch,
  onAdd,
  order,
  hiddenKeys,
  onMoveColumn,
  onToggleColumn,
  onResetColumns,
}) {
  const [input, setInput] = useState(search || '');

  useEffect(() => {
    setInput(search || '');
  }, [search]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 sm:max-w-md">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search name, email, phone…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <ColumnSelector
        order={order}
        hiddenKeys={hiddenKeys}
        onMove={onMoveColumn}
        onToggle={onToggleColumn}
        onReset={onResetColumns}
      />

      {onAdd && (
        <Button
          variant="primary"
          onClick={onAdd}
          className="ml-auto !gap-1.5 !rounded-md !px-3 !py-1.5 !text-xs"
        >
          + Add User
        </Button>
      )}
    </div>
  );
}
