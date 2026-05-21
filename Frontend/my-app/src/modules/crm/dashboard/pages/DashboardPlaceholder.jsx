import { useAuth } from '../../auth/hooks/useAuth';

export default function DashboardPlaceholder({ title = 'Dashboard' }) {
  const { user } = useAuth();
  const roleName = user?.role?.name || user?.roleName || 'Member';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">
          Logged in as <span className="font-medium text-slate-800">{user?.name || user?.email}</span>{' '}
          · Role: <span className="font-medium text-slate-800">{roleName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Enquiries today', 'Active leads', 'Won this month'].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-100 bg-white p-5 shadow-soft"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">—</p>
            <p className="mt-1 text-xs text-slate-400">Connect a data source to populate.</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-brand-200 bg-brand-100 p-5">
        <p className="text-sm font-medium text-slate-900">Your permissions</p>
        <p className="mt-1 text-xs text-slate-600">
          Menu items in the sidebar are filtered based on the permissions returned by{' '}
          <code className="rounded bg-white px-1.5 py-0.5 text-[11px]">/auth/me</code>.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(user?.permissions || []).slice(0, 24).map((p) => (
            <span
              key={p}
              className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700"
            >
              {p}
            </span>
          ))}
          {(user?.permissions || []).length > 24 && (
            <span className="text-[11px] text-slate-500">
              +{user.permissions.length - 24} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
