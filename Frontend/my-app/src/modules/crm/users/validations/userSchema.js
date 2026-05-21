const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-+()]{6,19}$/;

export const userRules = {
  name: {
    required: 'Full name is required',
    minLength: { value: 2, message: 'Minimum 2 characters' },
    maxLength: { value: 100, message: 'Maximum 100 characters' },
  },
  email: {
    required: 'Email is required',
    pattern: { value: EMAIL_RE, message: 'Enter a valid email address' },
  },
  phone: {
    validate: (v) => {
      if (!v) return true;
      if (v.length < 7) return 'Minimum 7 digits';
      if (v.length > 20) return 'Maximum 20 characters';
      if (!PHONE_RE.test(v)) return 'Enter a valid phone number';
      return true;
    },
  },
  roleIds: {
    validate: (v) => (Array.isArray(v) && v.length > 0) || 'Select at least one role',
  },
};

export const defaultUserValues = {
  name: '',
  email: '',
  phone: '',
  roleIds: [],
};

export const userToFormValues = (user) => {
  if (!user) return { ...defaultUserValues };
  const primary = user.roleId?._id || user.roleId;
  const additional = (user.additionalRoleIds || []).map((r) => r?._id || r);
  const roleIds = [primary, ...additional].filter(Boolean);
  return {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    roleIds: [...new Set(roleIds.map(String))],
  };
};
