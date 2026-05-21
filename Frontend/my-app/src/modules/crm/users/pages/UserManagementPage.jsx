import { useEffect, useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../../auth/hooks/useAuth';
import { PERMISSIONS } from '../../auth/constants/permissions';
import { UserKPIs } from '../components/UserKPIs';
import { UsersFiltersBar } from '../components/UsersFiltersBar';
import { UsersTable } from '../components/UsersTable';
import { UserFormModal } from '../components/UserFormModal';
import { Pagination } from '../../enquiries/components/Pagination';
import { Alert } from '../../../../shared/components/Alert';
import { Toast } from '../../../../shared/components/Toast';
import {
  DEFAULT_USER_COLUMN_ORDER,
  USER_COLUMN_STORAGE_KEY,
} from '../constants/userColumns';

export default function UserManagementPage() {
  const { can } = useAuth();
  const {
    items,
    pagination,
    search,
    sort,
    error,
    roles,
    stats,
    statsStatus,
    saving,
    saveError,
    isLoading,
    isError,
    isEmpty,
    setSearch,
    setPage,
    setSort,
    clearSaveError,
    create,
    update,
    refreshAll,
  } = useUsers();

  const [colState, setColState] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_COLUMN_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.order?.length) return parsed;
      }
    } catch (_) {
      // ignore
    }
    return { order: DEFAULT_USER_COLUMN_ORDER, hidden: [] };
  });

  useEffect(() => {
    localStorage.setItem(USER_COLUMN_STORAGE_KEY, JSON.stringify(colState));
  }, [colState]);

  const [modal, setModal] = useState({ open: false, mode: 'create', user: null });
  const [toast, setToast] = useState({ open: false, tone: 'success', message: '' });

  if (!can(PERMISSIONS.user.read)) {
    return (
      <div className="mx-auto max-w-md">
        <Alert tone="error" title="Access restricted">
          You don&apos;t have permission to view users.
        </Alert>
      </div>
    );
  }

  const canCreate = can(PERMISSIONS.user.create);
  const canEdit = can(PERMISSIONS.user.update);

  const moveColumn = (idx, dir) => {
    setColState((prev) => {
      const order = [...prev.order];
      const target = idx + dir;
      if (target < 0 || target >= order.length) return prev;
      [order[idx], order[target]] = [order[target], order[idx]];
      return { ...prev, order };
    });
  };

  const toggleColumn = (key) => {
    setColState((prev) => ({
      ...prev,
      hidden: prev.hidden.includes(key)
        ? prev.hidden.filter((k) => k !== key)
        : [...prev.hidden, key],
    }));
  };

  const resetColumns = () => setColState({ order: DEFAULT_USER_COLUMN_ORDER, hidden: [] });

  const openCreate = () => {
    if (!canCreate) return;
    clearSaveError();
    setModal({ open: true, mode: 'create', user: null });
  };

  const openEdit = (user) => {
    if (!canEdit) return;
    clearSaveError();
    setModal({ open: true, mode: 'edit', user });
  };

  const handleSubmit = async (values) => {
    try {
      if (modal.mode === 'edit' && modal.user?._id) {
        await update(modal.user._id, values);
        setToast({ open: true, tone: 'success', message: 'User updated' });
      } else {
        const { tempPassword } = await create(values);
        setToast({
          open: true,
          tone: 'success',
          message: `User created · Temp password: ${tempPassword}`,
        });
      }
      setModal((m) => ({ ...m, open: false }));
      refreshAll();
    } catch (_) {
      // saveError stays in slice
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        duration={toast.message.includes('Temp password') ? 9000 : 3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">User Management</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Manage team members, roles and access.
        </p>
      </div>

      <UserKPIs stats={stats} loading={statsStatus === 'loading' || statsStatus === 'idle'} />

      <UsersFiltersBar
        search={search}
        onSearch={setSearch}
        onAdd={canCreate ? openCreate : undefined}
        order={colState.order}
        hiddenKeys={colState.hidden}
        onMoveColumn={moveColumn}
        onToggleColumn={toggleColumn}
        onResetColumns={resetColumns}
      />

      {isError && !isLoading && (
        <Alert tone="error" title="Couldn't load users">
          <div className="flex items-center justify-between gap-3">
            <span>{error?.message || 'Please try again.'}</span>
            <button
              type="button"
              onClick={refreshAll}
              className="rounded-md border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </Alert>
      )}

      <UsersTable
        users={items}
        order={colState.order}
        hiddenKeys={colState.hidden}
        sort={sort}
        onSort={setSort}
        isLoading={isLoading}
        isEmpty={isEmpty}
        canEdit={canEdit}
        onEdit={openEdit}
      />

      {!isLoading && pagination.total > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onChange={setPage}
          />
        </div>
      )}

      <UserFormModal
        open={modal.open}
        mode={modal.mode}
        user={modal.user}
        roles={roles}
        saving={saving}
        serverError={saveError}
        onClose={() => {
          setModal((m) => ({ ...m, open: false }));
          clearSaveError();
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
