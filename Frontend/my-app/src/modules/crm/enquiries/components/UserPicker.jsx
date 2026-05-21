import { forwardRef, useEffect, useState } from 'react';
import { axiosClient } from '../../../../shared/api/axiosClient';
import { SelectInput } from '../../../../shared/components/SelectInput';

const fetchUsers = async () => {
  const res = await axiosClient.get('/users', { params: { limit: 100, status: 'active' } });
  const data = res?.data?.data ?? res?.data;
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  return items;
};

export const UserPicker = forwardRef(function UserPicker(
  { label = 'Assigned Qualification User', error, disabled, ...rest },
  ref,
) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchUsers()
      .then((items) => {
        if (active) setUsers(items);
      })
      .catch((err) => {
        if (active) setLoadError(err?.response?.data?.message || err?.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const options = users.map((u) => ({
    value: u._id,
    label: u.name ? `${u.name}${u.email ? ` · ${u.email}` : ''}` : u.email || u._id,
  }));

  return (
    <SelectInput
      ref={ref}
      label={label}
      error={error}
      disabled={disabled || loading}
      placeholder={loading ? 'Loading users…' : loadError ? 'Could not load users' : 'Unassigned'}
      options={options}
      {...rest}
    >
      <option value="">Unassigned</option>
    </SelectInput>
  );
});
