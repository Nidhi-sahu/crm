export const hasPermission = (user, key) => {
  if (!user) return false;
  if (!key) return true;
  const perms = user.permissions || [];
  return perms.includes(key);
};

export const hasAnyPermission = (user, keys = []) => {
  if (!keys.length) return true;
  return keys.some((k) => hasPermission(user, k));
};
