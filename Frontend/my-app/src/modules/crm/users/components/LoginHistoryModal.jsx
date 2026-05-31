import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { usersService } from '../services/usersService';

const formatDateTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function LoginHistoryModal({ open, user, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !user?._id) {
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    usersService
      .loginHistory(user._id)
      .then(setData)
      .catch(() => setError('Could not load login history'))
      .finally(() => setLoading(false));
  }, [open, user?._id]);

  if (!user) return null;
  const items = data?.items || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Login & Logout History"
      subtitle={user.name || user.email}
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-end">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-3">
        {data?.isLocked && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            🔒 <strong>Currently locked</strong>
            {data.lockReason && <span> — {data.lockReason}</span>}
            {data.lockedAt && (
              <span className="ml-1 text-rose-600">· {formatDateTime(data.lockedAt)}</span>
            )}
          </div>
        )}

        {loading && (
          <p className="text-xs italic text-slate-500">Loading history…</p>
        )}
        {error && <p className="text-xs text-rose-600">{error}</p>}

        {!loading && items.length === 0 && (
          <p className="text-xs italic text-slate-400">No login history yet.</p>
        )}

        {!loading && items.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Time</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Event</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">IP</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-800">{formatDateTime(item.at)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.event === 'logout'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.event === 'logout' ? 'Logout' : 'Login'}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                      {item.ip || '—'}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-600">
                      <span className="block max-w-[260px] truncate" title={item.userAgent}>
                        {item.userAgent || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
