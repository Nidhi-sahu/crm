export const initialsOf = (name = '') =>
  name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';

const PW_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

// Generates a temp password — at least one upper, lower, digit, special. Min 10 chars.
export const generateTempPassword = () => {
  let core = '';
  for (let i = 0; i < 6; i += 1) {
    core += PW_CHARS[Math.floor(Math.random() * PW_CHARS.length)];
  }
  return `Crm@${core}9`;
};

export const roleName = (user) =>
  user?.roleId?.name || user?.role?.name || user?.roleName || '—';
