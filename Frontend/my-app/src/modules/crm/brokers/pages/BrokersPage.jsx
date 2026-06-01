import { useEffect, useState } from 'react';
import { brokersService } from '../services/brokersService';
import { usersService } from '../../users/services/usersService';
import { useAuth } from '../../auth/hooks/useAuth';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Alert } from '../../../../shared/components/Alert';
import { Toast } from '../../../../shared/components/Toast';

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

function BrokerFormModal({ open, mode = 'create', broker = null, onClose, onSaved, salesUsers, visitUsers }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    managedBySalesId: '',
    managedByVisitId: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    if (!open) {
      setError('');
      setTempPassword('');
      return;
    }
    if (isEdit && broker) {
      setForm({
        name: broker.name || '',
        email: broker.email || '',
        phone: broker.phone || '',
        managedBySalesId: broker.managedBySalesId?._id || broker.managedBySalesId || '',
        managedByVisitId: broker.managedByVisitId?._id || broker.managedByVisitId || '',
      });
    } else {
      setForm({ name: '', email: '', phone: '', managedBySalesId: '', managedByVisitId: '' });
    }
  }, [open, isEdit, broker]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim() || (!isEdit && !form.email.trim())) {
      setError(isEdit ? 'Name is required' : 'Name and Email are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await brokersService.update(broker._id, {
          name: form.name.trim(),
          phone: form.phone.trim(),
          managedBySalesId: form.managedBySalesId || null,
          managedByVisitId: form.managedByVisitId || null,
        });
        onSaved?.();
        onClose();
      } else {
        const result = await brokersService.create({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          managedBySalesId: form.managedBySalesId || null,
          managedByVisitId: form.managedByVisitId || null,
        });
        setTempPassword(result?.tempPassword || '');
        onSaved?.();
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save broker');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Broker' : 'Add Broker'}
      subtitle={isEdit ? 'Update broker details (email cannot be changed)' : 'Broker logs in with their email — view-only access to referred leads'}
      width="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Close</Button>
          {!tempPassword && (
            <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
              {isEdit ? 'Save Changes' : 'Create Broker'}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        {error && <Alert tone="error" title="Couldn't save">{error}</Alert>}
        {tempPassword ? (
          <Alert tone="success" title="Broker created">
            <p>Share these credentials with the broker:</p>
            <div className="mt-2 rounded bg-white/70 p-2 text-xs">
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Temp Password:</strong> <code className="font-mono">{tempPassword}</code></p>
            </div>
          </Alert>
        ) : (
          <>
            <Input label="Broker Name *" value={form.name} onChange={set('name')} placeholder="e.g. Rajesh Properties" />
            <Input label="Email *" type="email" value={form.email} onChange={set('email')} placeholder="rajesh@brokers.com" disabled={isEdit} />
            <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 9XXXXXXXXX" />
            <SelectInput
              label="Managed By (Sales Person)"
              value={form.managedBySalesId}
              onChange={set('managedBySalesId')}
              options={[
                { value: '', label: 'Select sales person' },
                ...salesUsers.map((u) => ({ value: u._id, label: u.name || u.email })),
              ]}
            />
            <SelectInput
              label="Managed By (Visit Person)"
              value={form.managedByVisitId}
              onChange={set('managedByVisitId')}
              options={[
                { value: '', label: 'Select visit team member' },
                ...visitUsers.map((u) => ({ value: u._id, label: u.name || u.email })),
              ]}
            />
          </>
        )}
      </div>
    </Modal>
  );
}

function BrokerStatsCard({ stats }) {
  if (!stats) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Total Enquiries</p>
          <p className="text-xl font-semibold text-slate-900">{stats.totals?.enquiries || 0}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Total Leads</p>
          <p className="text-xl font-semibold text-brand-600">{stats.totals?.leads || 0}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Active</p>
          <p className="text-xl font-semibold text-emerald-600">{stats.totals?.active || 0}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Won</p>
          <p className="text-xl font-semibold text-amber-600">{stats.totals?.won || 0}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Lost / Dropped</p>
          <p className="text-xl font-semibold text-rose-600">{stats.totals?.lost || 0}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Project-wise Lead Count
        </p>
        {(stats.projects || []).length === 0 ? (
          <p className="text-xs italic text-slate-400">No projects yet.</p>
        ) : (
          <div className="space-y-1.5">
            {stats.projects.map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5 text-sm">
                <span className="text-slate-800">{p.name}</span>
                <span className="text-slate-600">
                  <strong className="text-brand-700">{p.leads}</strong> leads
                  {p.enquiries > p.leads && <span className="text-slate-400"> · {p.enquiries} enquiries</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrokersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = (currentUser?.roleId?.name || currentUser?.role?.name) === 'Administrator';

  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState(null);
  const [salesUsers, setSalesUsers] = useState([]);
  const [visitUsers, setVisitUsers] = useState([]);
  const [formModal, setFormModal] = useState({ open: false, mode: 'create', broker: null });
  const [leads, setLeads] = useState([]);
  const [toast, setToast] = useState({ open: false, tone: 'success', message: '' });

  const reload = async () => {
    setLoading(true);
    try {
      const items = await brokersService.list();
      setBrokers(items);
      if (items.length > 0 && !selected) {
        setSelected(items[0]);
      }
    } catch {
      setError('Could not load brokers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    if (isAdmin) {
      usersService.list({ limit: 100 }).then(({ items }) => {
        setSalesUsers(items.filter((u) => (u.roleId?.name || u.role?.name) === 'Sales Person'));
        setVisitUsers(items.filter((u) => (u.roleId?.name || u.role?.name) === 'Visit Team'));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected?._id) {
      setStats(null);
      setLeads([]);
      return;
    }
    setStats(null);
    setLeads([]);
    brokersService.stats(selected._id).then(setStats).catch(() => setStats(null));
    brokersService.leads(selected._id).then(setLeads).catch(() => setLeads([]));
  }, [selected?._id]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Brokers</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage brokers, track lead generation, and assign managers.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setFormModal({ open: true, mode: 'create', broker: null })}>
            + Add Broker
          </Button>
        )}
      </div>

      {error && <Alert tone="error" title="Error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-soft">
          <p className="px-2 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Brokers ({brokers.length})
          </p>
          {loading && <p className="px-2 py-3 text-xs italic text-slate-400">Loading…</p>}
          {!loading && brokers.length === 0 && (
            <p className="px-2 py-3 text-xs italic text-slate-400">No brokers yet.</p>
          )}
          {!loading && brokers.map((b) => {
            const active = selected?._id === b._id;
            return (
              <button
                key={b._id}
                type="button"
                onClick={() => setSelected(b)}
                className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left ${
                  active ? 'bg-brand-50' : 'hover:bg-slate-50'
                }`}
              >
                <span className={`text-sm font-medium ${active ? 'text-brand-700' : 'text-slate-800'}`}>
                  {b.name}
                </span>
                <span className="text-[11px] text-slate-500">{b.email}</span>
                {b.managedBySalesId?.name && (
                  <span className="text-[10px] text-slate-400">
                    Sales: {b.managedBySalesId.name}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <section className="space-y-3">
          {!selected ? (
            <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Select a broker from the left to view details.
            </p>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{selected.name}</p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setFormModal({ open: true, mode: 'edit', broker: selected })}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 20h4L19 9l-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
                <div className="mt-1 grid grid-cols-1 gap-1 text-xs text-slate-600 sm:grid-cols-2">
                  <div><span className="text-slate-400">Email:</span> {selected.email}</div>
                  <div><span className="text-slate-400">Phone:</span> {selected.phone || '—'}</div>
                  <div><span className="text-slate-400">Sales Manager:</span> {selected.managedBySalesId?.name || '—'}</div>
                  <div><span className="text-slate-400">Visit Manager:</span> {selected.managedByVisitId?.name || '—'}</div>
                  <div><span className="text-slate-400">Last Login:</span> {formatDate(selected.lastLoginAt)}</div>
                  <div><span className="text-slate-400">Created:</span> {formatDate(selected.createdAt)}</div>
                </div>
              </div>

              <BrokerStatsCard stats={stats} />

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Referred Leads ({leads.length})
                </p>
                {leads.length === 0 ? (
                  <p className="text-xs italic text-slate-400">No leads referred yet.</p>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-[12px]">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-600">Client</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-600">Project</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-600">Stage</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-600">Status</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-600">Assigned</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leads.map((l) => (
                          <tr key={l._id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 text-slate-800">
                              {l.enquiryId?.clientName || '—'}
                              {l.enquiryId?.clientPhone && (
                                <span className="block text-[10px] text-slate-500">{l.enquiryId.clientPhone}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-700">{l.project || l.enquiryId?.project || '—'}</td>
                            <td className="px-3 py-2 text-slate-700">{l.currentStageId?.name || '—'}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  l.status === 'won'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : l.status === 'active'
                                    ? 'bg-brand-100 text-brand-700'
                                    : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {l.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {l.assignedTo?.name || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <BrokerFormModal
        open={formModal.open}
        mode={formModal.mode}
        broker={formModal.broker}
        onClose={() => setFormModal({ open: false, mode: 'create', broker: null })}
        salesUsers={salesUsers}
        visitUsers={visitUsers}
        onSaved={() => {
          setToast({
            open: true,
            tone: 'success',
            message: formModal.mode === 'edit' ? 'Broker updated' : 'Broker created',
          });
          reload();
        }}
      />
    </div>
  );
}
