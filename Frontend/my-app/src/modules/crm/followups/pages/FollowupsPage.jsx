import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { remindersService } from '../services/remindersService';
import { Alert } from '../../../../shared/components/Alert';
import { Spinner } from '../../../../shared/components/Spinner';
import { Toast } from '../../../../shared/components/Toast';

const fmt = (value, time) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const base = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return time ? `${base} · ${time}` : base;
};

const daysAgo = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diff <= 0) return 'today';
  return `${diff} day${diff > 1 ? 's' : ''} overdue`;
};

function ReminderRow({ r, overdue, onComplete, completing }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
        overdue ? 'border-rose-200 bg-rose-50/60' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{r.title}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          <span className="capitalize">{r.referenceType}</span> · Due {fmt(r.reminderAt, r.reminderTime)}
          {overdue && (
            <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              {daysAgo(r.reminderAt)}
            </span>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onComplete(r._id)}
        disabled={completing}
        className="shrink-0 rounded-md border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
      >
        Mark Done
      </button>
    </div>
  );
}

export default function FollowupsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: 'success', message: '' });

  const load = useCallback(() => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    remindersService
      .myPending(user._id)
      .then(setItems)
      .catch(() => setError('Could not load follow-ups.'))
      .finally(() => setLoading(false));
  }, [user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const { overdue, upcoming } = useMemo(() => {
    const now = Date.now();
    const od = [];
    const up = [];
    items.forEach((r) => {
      if (new Date(r.reminderAt).getTime() < now) od.push(r);
      else up.push(r);
    });
    return { overdue: od, upcoming: up };
  }, [items]);

  const handleComplete = async (id) => {
    setCompleting(true);
    try {
      await remindersService.complete(id);
      setToast({ open: true, tone: 'success', message: 'Follow-up completed' });
      setItems((list) => list.filter((r) => r._id !== id));
    } catch (_) {
      setToast({ open: true, tone: 'error', message: 'Could not complete' });
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Follow-ups</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Your pending tasks. Overdue items stay here until you mark them done.
        </p>
      </div>

      {error && <Alert tone="error" title="Failed">{error}</Alert>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
          <Spinner /> Loading follow-ups…
        </div>
      ) : (
        <>
          {/* Overdue / Pending Tasks */}
          <section className="space-y-2 rounded-xl border border-rose-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-rose-700">Overdue / Pending Tasks</h2>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                {overdue.length}
              </span>
            </div>
            {overdue.length === 0 ? (
              <p className="py-2 text-xs text-slate-400">No overdue follow-ups. 🎉</p>
            ) : (
              <div className="space-y-2">
                {overdue.map((r) => (
                  <ReminderRow key={r._id} r={r} overdue onComplete={handleComplete} completing={completing} />
                ))}
              </div>
            )}
          </section>

          {/* Upcoming */}
          <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Upcoming Follow-ups</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {upcoming.length}
              </span>
            </div>
            {upcoming.length === 0 ? (
              <p className="py-2 text-xs text-slate-400">No upcoming follow-ups.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((r) => (
                  <ReminderRow key={r._id} r={r} onComplete={handleComplete} completing={completing} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
