import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { Alert } from '../../../../shared/components/Alert';
import { userRules, defaultUserValues, userToFormValues } from '../validations/userSchema';

export function UserFormModal({
  open,
  mode = 'create',
  user = null,
  roles = [],
  saving,
  serverError,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === 'edit';
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: isEdit ? userToFormValues(user) : { ...defaultUserValues },
  });

  useEffect(() => {
    if (open) {
      reset(isEdit ? userToFormValues(user) : { ...defaultUserValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?._id]);

  useEffect(() => {
    if (!serverError?.details) return;
    serverError.details.forEach((d) => {
      if (d.field) setError(d.field, { type: 'server', message: d.message });
    });
  }, [serverError, setError]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit User' : 'Add User'}
      subtitle={
        isEdit
          ? 'Update user details and roles.'
          : 'Create a team member — set their login password.'
      }
      width="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} loading={saving} disabled={saving}>
            {isEdit ? 'Save Changes' : 'Save User'}
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-3" noValidate>
        {serverError?.message && !serverError.details?.length && (
          <Alert tone="error" title="Couldn't save">
            {serverError.message}
          </Alert>
        )}

        <Input
          label="Full Name *"
          placeholder="e.g. Rahul Sharma"
          error={errors.name?.message}
          {...register('name', userRules.name)}
        />
        <Input
          label="Email Address *"
          type="email"
          placeholder="rahul@company.com"
          error={errors.email?.message}
          {...register('email', userRules.email)}
        />
        <Input
          label="Phone Number"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          {...register('phone', userRules.phone)}
        />
        <Input
          label={isEdit ? 'Change Password' : 'Password *'}
          type={showPassword ? 'text' : 'password'}
          placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 characters'}
          error={errors.password?.message}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
              className="rounded p-1 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9 9 0 0 1 21 12a9 9 0 0 1-1.7 2.7M6.1 6.1A9 9 0 0 0 3 12s3.5 7 9 7a8.6 8.6 0 0 0 3-.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              )}
            </button>
          }
          {...register('password', isEdit ? userRules.passwordOptional : userRules.password)}
        />

        <div>
          <p className="field-label">Roles *</p>
          <p className="mb-1.5 text-[11px] text-slate-500">
            Select one or more — user gets the combined permissions of all checked roles.
          </p>
          <div className="space-y-1.5 rounded-lg border border-slate-200 p-2.5">
            {roles.length === 0 && (
              <p className="text-xs text-slate-400">No roles available.</p>
            )}
            {roles.map((r) => (
              <label key={r._id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={r._id}
                  className="h-3.5 w-3.5 accent-brand-600"
                  {...register('roleIds', userRules.roleIds)}
                />
                <span className="text-slate-700">{r.name}</span>
              </label>
            ))}
          </div>
          {errors.roleIds && <p className="field-error">{errors.roleIds.message}</p>}
        </div>
      </form>
    </Modal>
  );
}
