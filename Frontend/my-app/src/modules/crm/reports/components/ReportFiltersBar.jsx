import { useEffect, useState } from 'react';
import { axiosClient } from '../../../../shared/api/axiosClient';
import { Button } from '../../../../shared/components/Button';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Input } from '../../../../shared/components/Input';
import { DATE_PRESETS, REPORT_TYPES } from '../constants/dateRanges';

export function ReportFiltersBar({ filters, onPatch, onGenerate, onExport, loading, canExport }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (filters.reportType !== 'salesPerson' || users.length > 0) return;
    axiosClient
      .get('/users', { params: { limit: 100, status: 'active' } })
      .then((res) => {
        const data = res?.data?.data;
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setUsers(items);
      })
      .catch(() => setUsers([]));
  }, [filters.reportType, users.length]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
      {/* Report type tabs */}
      <div className="flex flex-wrap gap-1.5">
        {REPORT_TYPES.map((t) => {
          const active = filters.reportType === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onPatch({ reportType: t.value })}
              className={[
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-brand-300 bg-brand-100 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Date range + salesperson + actions */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[170px]">
          <SelectInput
            label="Date Range"
            options={DATE_PRESETS}
            value={filters.preset}
            onChange={(e) => onPatch({ preset: e.target.value })}
          />
        </div>

        {filters.preset === 'custom' && (
          <>
            <div className="min-w-[150px]">
              <Input
                label="From"
                type="date"
                value={filters.customFrom}
                onChange={(e) => onPatch({ customFrom: e.target.value })}
              />
            </div>
            <div className="min-w-[150px]">
              <Input
                label="To"
                type="date"
                value={filters.customTo}
                onChange={(e) => onPatch({ customTo: e.target.value })}
              />
            </div>
          </>
        )}

        {filters.reportType === 'salesPerson' && (
          <div className="min-w-[200px]">
            <SelectInput
              label="Sales Person"
              placeholder="Select a sales person"
              options={users.map((u) => ({
                value: u._id,
                label: u.name || u.email || u._id,
              }))}
              value={filters.salespersonId}
              onChange={(e) => onPatch({ salespersonId: e.target.value })}
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={onExport}
            disabled={!canExport || loading}
            className="!rounded-md !px-3 !py-2 !text-xs"
          >
            Export Report
          </Button>
          <Button
            variant="primary"
            onClick={onGenerate}
            loading={loading}
            disabled={loading}
            className="!rounded-md !px-4 !py-2 !text-xs"
          >
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}
