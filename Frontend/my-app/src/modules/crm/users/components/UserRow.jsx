import { cloneElement } from 'react';
import { RoleBadge } from './RoleBadge';
import { initialsOf, roleName } from '../utils/userFormatters';

const Cell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 align-middle text-[13px] text-slate-700 ${className}`.trim()}>
    {children || <span className="text-slate-300">—</span>}
  </td>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 20h4L19 9l-4-4L4 16v4Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export function UserRow({ user, order, hiddenKeys, canEdit, isAdmin, onEdit, onUnlock, onViewHistory }) {
  const renderCell = (key) => {
    switch (key) {
      case 'name':
        return (
          <Cell>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-200 text-xs font-semibold text-slate-800">
                {initialsOf(user.name)}
              </span>
              <span className="flex min-w-0 flex-col">
                <span
                  className="block max-w-[160px] truncate font-medium text-slate-900"
                  title={user.name}
                >
                  {user.name || '—'}
                </span>
                {user.isLocked && (
                  <span
                    className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700"
                    title={user.lockReason || 'Account locked'}
                  >
                    <LockIcon /> Locked
                  </span>
                )}
              </span>
            </div>
          </Cell>
        );
      case 'email':
        return (
          <Cell>
            <span className="block max-w-[220px] truncate" title={user.email}>
              {user.email}
            </span>
          </Cell>
        );
      case 'phone':
        return <Cell className="whitespace-nowrap">{user.phone}</Cell>;
      case 'role': {
        const primaryName = roleName(user);
        const extraNames = (user.additionalRoleIds || [])
          .map((r) => r?.name || r)
          .filter((n) => n && n !== primaryName);
        const allRoles = [primaryName, ...extraNames];
        return (
          <Cell>
            <div className="flex flex-wrap items-center gap-1.5">
              {allRoles.map((name) => (
                <RoleBadge key={name} role={{ name }} />
              ))}
            </div>
          </Cell>
        );
      }
      case 'action':
        return (
          <Cell className="text-right">
            <div className="inline-flex items-center gap-1">
              {isAdmin && user.isLocked && (
                <button
                  type="button"
                  title="Unlock user"
                  aria-label="Unlock user"
                  onClick={() => onUnlock?.(user)}
                  className="rounded-md p-1.5 text-rose-600 hover:bg-rose-100"
                >
                  <LockIcon />
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  title="View login history"
                  aria-label="View login history"
                  onClick={() => onViewHistory?.(user)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-brand-100 hover:text-brand-600"
                >
                  <HistoryIcon />
                </button>
              )}
              {canEdit ? (
                <button
                  type="button"
                  title="Edit user"
                  aria-label="Edit user"
                  onClick={() => onEdit?.(user)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-brand-100 hover:text-brand-600"
                >
                  <EditIcon />
                </button>
              ) : (
                !isAdmin && <span className="text-slate-300">—</span>
              )}
            </div>
          </Cell>
        );
      default:
        return <Cell />;
    }
  };

  const visible = order.filter((k) => !hiddenKeys.includes(k));

  return (
    <tr className="transition-colors hover:bg-slate-50">
      {visible.map((key) => cloneElement(renderCell(key), { key }))}
    </tr>
  );
}
