import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { ROLES } from '../../auth/constants/roles';
import { projectsService } from '../services/projectsService';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { Button } from '../../../../shared/components/Button';
import { Alert } from '../../../../shared/components/Alert';
import { Spinner } from '../../../../shared/components/Spinner';
import { Toast } from '../../../../shared/components/Toast';
import { extractApiError } from '../../../../shared/api/axiosClient';

const STATUS_TONE = {
  ongoing: 'bg-emerald-50 text-emerald-700',
  upcoming: 'bg-amber-50 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const roleName = user?.role?.name || user?.roleName || user?.roleId?.name;
  const isAdmin = roleName === ROLES.ADMIN;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, project: null });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [toast, setToast] = useState({ open: false, tone: 'success', message: '' });

  const load = () => {
    setLoading(true);
    setError(null);
    projectsService
      .list()
      .then(setItems)
      .catch(() => setError('Could not load projects.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (form) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (modal.project?._id) {
        await projectsService.update(modal.project._id, form);
        setToast({ open: true, tone: 'success', message: 'Project updated' });
      } else {
        await projectsService.create(form);
        setToast({ open: true, tone: 'success', message: 'Project added' });
      }
      setModal({ open: false, project: null });
      load();
    } catch (err) {
      setSaveError(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Projects</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Company projects — visible to everyone. Used as options in the enquiry “Preferred Location”.
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            onClick={() => setModal({ open: true, project: null })}
            className="!gap-1.5 !rounded-md !px-3 !py-1.5 !text-xs"
          >
            + Add Project
          </Button>
        )}
      </div>

      {error && <Alert tone="error" title="Failed">{error}</Alert>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Project Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Property Type</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-4 py-10 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <Spinner /> Loading projects…
                    </span>
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-slate-700">No projects yet</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {isAdmin ? 'Click “Add Project” to create one.' : 'Ask an admin to add projects.'}
                    </p>
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((p) => (
                  <tr key={p._id} className="text-[13px] text-slate-700 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3">{p.location || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3">{p.propertyType || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_TONE[p.status] || STATUS_TONE.ongoing}`}>
                        {p.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setModal({ open: true, project: p })}
                          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <ProjectFormModal
          open={modal.open}
          project={modal.project}
          saving={saving}
          saveError={saveError}
          onClose={() => {
            setModal({ open: false, project: null });
            setSaveError(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
