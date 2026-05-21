import { roleTone } from '../constants/userRoles';

export function RoleBadge({ role }) {
  const name = role?.name || role || '—';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[13px] font-medium ${roleTone(name)}`}
    >
      {name}
    </span>
  );
}
