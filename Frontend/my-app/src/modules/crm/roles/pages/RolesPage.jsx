import { useEffect, useMemo, useState } from 'react';
import { rolesService } from '../services/rolesService';
import { permissionsService } from '../services/permissionsService';
import {
  CATEGORIES,
  MODULE_LABEL,
  ACTION_LABEL,
  ACTION_ORDER,
} from '../constants/moduleCategories';
import { Toast } from '../../../../shared/components/Toast';

const TONE_BY_NAME = {
  'Administrator': 'rose',
  'Sales Coordinator': 'brand',
  'Sales Person': 'emerald',
  'Lead Generator': 'amber',
  'Tele Sales': 'violet',
  'Visit Team': 'cyan',
};

const DESCRIPTION_BY_NAME = {
  'Administrator': 'Full system access',
  'Sales Coordinator': 'Lead assignment and team oversight',
  'Sales Person': 'Manage assigned leads',
  'Lead Generator': 'Enquiry capture and qualification',
  'Tele Sales': 'Lead followups and visit confirmation',
  'Visit Team': 'Site visit coordination and tracking',
};

const TONE_DOT = {
  rose: 'bg-rose-400',
  brand: 'bg-brand-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-500',
  slate: 'bg-slate-400',
};

export default function RolesPage() {
  const [tab, setTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [permCatalog, setPermCatalog] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [draftPerms, setDraftPerms] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([rolesService.list(), permissionsService.list()])
      .then(([roleItems, permItems]) => {
        if (cancelled) return;
        setRoles(roleItems);
        setPermCatalog(permItems);
        if (roleItems.length > 0) setSelectedRoleId(roleItems[0]._id);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load roles or permissions');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRole = roles.find((r) => r._id === selectedRoleId) || null;

  useEffect(() => {
    if (selectedRole) {
      setDraftPerms(new Set(selectedRole.permissions || []));
      setSaveError(null);
    } else {
      setDraftPerms(new Set());
    }
  }, [selectedRole]);

  const permsByModule = useMemo(() => {
    const map = {};
    permCatalog.forEach((p) => {
      if (!map[p.module]) map[p.module] = [];
      map[p.module].push(p);
    });
    return map;
  }, [permCatalog]);

  const originalSet = useMemo(
    () => new Set(selectedRole?.permissions || []),
    [selectedRole],
  );

  const isDirty = useMemo(() => {
    if (draftPerms.size !== originalSet.size) return true;
    for (const p of draftPerms) if (!originalSet.has(p)) return true;
    return false;
  }, [draftPerms, originalSet]);

  const togglePerm = (key) => {
    setDraftPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const resetDraft = () => {
    setDraftPerms(new Set(selectedRole?.permissions || []));
    setSaveError(null);
  };

  const saveChanges = async () => {
    if (!selectedRole || !isDirty) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await rolesService.update(selectedRole._id, {
        permissions: Array.from(draftPerms),
      });
      setRoles((prev) =>
        prev.map((r) =>
          r._id === selectedRole._id
            ? { ...r, permissions: updated?.permissions || Array.from(draftPerms) }
            : r,
        ),
      );
      setToast({ tone: 'success', message: 'Permissions updated' });
    } catch {
      setSaveError('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Toast
        open={!!toast}
        tone={toast?.tone}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Roles &amp; Permissions
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Control what each role can see and do across the system.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab('roles')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            tab === 'roles' ? 'bg-white text-slate-900 shadow-soft' : 'text-slate-600'
          }`}
        >
          Role Permissions
        </button>
        <button
          type="button"
          onClick={() => setTab('overrides')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            tab === 'overrides' ? 'bg-white text-slate-900 shadow-soft' : 'text-slate-600'
          }`}
        >
          User Overrides
        </button>
      </div>

      {tab === 'roles' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
          {/* Role list */}
          <aside className="space-y-1 self-start rounded-xl border border-slate-200 bg-white p-2 shadow-soft lg:sticky lg:top-4">
            <p className="px-2 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Roles ({roles.length})
            </p>

            {loading && <p className="px-2 py-3 text-xs text-slate-400">Loading roles…</p>}
            {!loading && error && <p className="px-2 py-3 text-xs text-rose-600">{error}</p>}
            {!loading && !error && roles.length === 0 && (
              <p className="px-2 py-3 text-xs text-slate-400">No roles found.</p>
            )}

            {!loading && !error && roles.map((r) => {
              const active = selectedRoleId === r._id;
              const tone = TONE_BY_NAME[r.name] || 'slate';
              const description = DESCRIPTION_BY_NAME[r.name] || r.description || '';
              const count = (r.permissions && r.permissions.length) || 0;
              return (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => setSelectedRoleId(r._id)}
                  className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    active ? 'bg-brand-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${TONE_DOT[tone]}`} />
                    <span
                      className={`text-sm font-medium ${
                        active ? 'text-brand-700' : 'text-slate-800'
                      }`}
                    >
                      {r.name}
                    </span>
                  </span>
                  {description && (
                    <span className="ml-4 text-[11px] text-slate-500">{description}</span>
                  )}
                  <span className="ml-4 text-[10px] text-slate-400">
                    {count} permissions
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Detail panel — editable permission matrix */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
            {!selectedRole ? (
              <p className="text-sm text-slate-400">Select a role from the left.</p>
            ) : (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-slate-900">{selectedRole.name}</p>
                      {isDirty && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          Unsaved changes
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {DESCRIPTION_BY_NAME[selectedRole.name] || selectedRole.description || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Permissions</p>
                      <p className="text-base font-semibold text-emerald-600">
                        {draftPerms.size}
                        {isDirty && (
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            (was {originalSet.size})
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetDraft}
                      disabled={saving || !isDirty}
                      className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={saveChanges}
                      disabled={saving || !isDirty}
                      className="rounded-md bg-brand-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                {saveError && <p className="text-xs text-rose-600">{saveError}</p>}

                {/* Categories */}
                {CATEGORIES.map((cat) => {
                  const modules = cat.modules.filter((m) => permsByModule[m]);
                  if (modules.length === 0) return null;
                  return (
                    <section key={cat.key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {cat.label}
                        </p>
                        <span className="text-[10px] text-slate-400">({modules.length})</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {modules.map((mod) => {
                          const actions = [...(permsByModule[mod] || [])]
                            .filter((p) => p.action !== 'delete')
                            .sort((a, b) => {
                              const ai = ACTION_ORDER.indexOf(a.action);
                              const bi = ACTION_ORDER.indexOf(b.action);
                              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                            });
                          return (
                            <div
                              key={mod}
                              className="rounded-lg border border-slate-200 bg-white p-3"
                            >
                              <p className="mb-2 text-sm font-medium text-slate-800">
                                {MODULE_LABEL[mod] || mod}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {actions.map((a) => {
                                  const has = draftPerms.has(a.key);
                                  return (
                                    <button
                                      key={a.key}
                                      type="button"
                                      onClick={() => togglePerm(a.key)}
                                      disabled={saving}
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-60 ${
                                        has
                                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                      }`}
                                      title={a.description || a.key}
                                    >
                                      <span>{has ? '✓' : '·'}</span>
                                      {ACTION_LABEL[a.action] || a.action}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">User Overrides tab — aage step me banega.</p>
        </div>
      )}
    </div>
  );
}
