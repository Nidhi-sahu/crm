import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../../shared/components/Button';
import { Alert } from '../../../../shared/components/Alert';
import { Spinner } from '../../../../shared/components/Spinner';
import { enquiryService } from '../services/enquiryService';

const initials = (name = '') =>
  name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';

export function BulkDistributePanel({ total, onAssign, onSkip, assigning, assignError }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [counts, setCounts] = useState({});
  const [included, setIncluded] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const list = await enquiryService.listTelesalesUsers();
        if (!active) return;
        setUsers(list);
        const ids = list.map((u) => u._id);
        setIncluded(new Set(ids));
        setCounts(equalSplit(total, ids));
      } catch (_) {
        if (active) setLoadError('Could not load telesales users.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const includedIds = useMemo(
    () => users.filter((u) => included.has(u._id)).map((u) => u._id),
    [users, included],
  );

  const allocated = useMemo(
    () => includedIds.reduce((sum, id) => sum + (Number(counts[id]) || 0), 0),
    [includedIds, counts],
  );
  const remaining = total - allocated;
  const overAllocated = allocated > total;
  const pct = total > 0 ? Math.min(100, (allocated / total) * 100) : 0;

  const toggle = (id) => {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setCounts((prev) => ({ ...prev, [id]: included.has(id) ? 0 : prev[id] || 0 }));
  };

  const setCount = (id, value) => {
    const n = Math.max(0, Math.floor(Number(value) || 0));
    setCounts((prev) => ({ ...prev, [id]: n }));
  };

  const applyEqualSplit = () => setCounts(equalSplit(total, includedIds));

  const handleAssign = () => {
    const allocations = includedIds
      .map((userId) => ({ userId, count: Number(counts[userId]) || 0 }))
      .filter((a) => a.count > 0);
    if (!allocations.length) return;
    onAssign(allocations);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Spinner /> Loading telesales users…
      </div>
    );
  }

  if (loadError) {
    return <Alert tone="error" title="Failed">{loadError}</Alert>;
  }

  if (!users.length) {
    return (
      <Alert tone="info" title="No telesales users found">
        Create users with the “Tele Sales” role first, then distribute. The leads are imported and
        currently unassigned.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {assignError?.message && <Alert tone="error" title="Assign failed">{assignError.message}</Alert>}

      {/* Summary + progress */}
      <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-2xl font-semibold leading-none text-slate-900">{total}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">leads to distribute</p>
          </div>
          <button
            type="button"
            onClick={applyEqualSplit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Equal split
          </button>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-600">
              Allocated {allocated} / {total}
            </span>
            <span className={overAllocated ? 'font-medium text-rose-600' : 'text-slate-400'}>
              {overAllocated
                ? `Over by ${allocated - total}`
                : remaining > 0
                  ? `${remaining} unassigned`
                  : 'All allocated'}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${overAllocated ? 'bg-rose-400' : 'bg-brand-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="space-y-1.5">
        {users.map((u) => {
          const on = included.has(u._id);
          return (
            <div
              key={u._id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                on ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(u._id)}
                className="h-4 w-4 accent-brand-600"
              />
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  on ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {initials(u.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${on ? 'text-slate-800' : 'text-slate-400'}`}>
                  {u.name || u.email}
                </p>
                {u.email && u.name && (
                  <p className="truncate text-[11px] text-slate-400">{u.email}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={on ? counts[u._id] ?? 0 : 0}
                  disabled={!on}
                  onChange={(e) => setCount(u._id, e.target.value)}
                  className="w-[68px] rounded-md border border-slate-200 px-2 py-1 text-right text-sm text-slate-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-300"
                />
                <span className="text-[10px] uppercase tracking-wider text-slate-400">leads</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <Button variant="ghost" onClick={onSkip} disabled={assigning}>
          Skip for now
        </Button>
        <Button
          variant="primary"
          onClick={handleAssign}
          loading={assigning}
          disabled={assigning || allocated === 0 || overAllocated}
          className="!gap-1.5 !rounded-md !px-4 !py-1.5 !text-xs"
        >
          Assign {Math.min(allocated, total) || ''} leads
        </Button>
      </div>
    </div>
  );
}

function equalSplit(total, userIds) {
  const out = {};
  const n = userIds.length;
  if (!n) return out;
  const base = Math.floor(total / n);
  let rem = total - base * n;
  userIds.forEach((id) => {
    out[id] = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
  });
  return out;
}
