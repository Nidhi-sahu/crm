import { useState } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';
import { useAuth } from '../../auth/hooks/useAuth';
import { PERMISSIONS } from '../../auth/constants/permissions';
import { StepCard } from '../components/StepCard';
import { AddStepBar } from '../components/AddStepBar';
import { InstructionsCard } from '../components/InstructionsCard';
import { Button } from '../../../../shared/components/Button';
import { Alert } from '../../../../shared/components/Alert';
import { Toast } from '../../../../shared/components/Toast';
import { Skeleton } from '../../dashboard/components/Skeleton';
import { DEFAULT_STAGES } from '../constants/defaultStages';

export default function ConfigurationPage() {
  const { can } = useAuth();
  const {
    draft,
    error,
    saving,
    saveError,
    dirty,
    isLoading,
    isError,
    addStep,
    editStep,
    deleteStep,
    moveStep,
    resetToDefault,
    clearSaveError,
    reload,
    save,
  } = useConfiguration();

  const [toast, setToast] = useState({ open: false, tone: 'success', message: '' });

  if (!can(PERMISSIONS.leadStage.read)) {
    return (
      <div className="mx-auto max-w-md">
        <Alert tone="error" title="Access restricted">
          You don&apos;t have permission to view configuration.
        </Alert>
      </div>
    );
  }

  const canManage = can(PERMISSIONS.leadStage.update);

  const handleReset = () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Reset to the default CRM stages? Unsaved changes will be lost.')) return;
    resetToDefault();
  };

  const handleSave = async () => {
    if (draft.length === 0) {
      setToast({ open: true, tone: 'error', message: 'Add at least one step before saving.' });
      return;
    }
    clearSaveError();
    try {
      const result = await save(draft);
      const skipped = result?.skipped || [];
      setToast({
        open: true,
        tone: 'success',
        message: skipped.length
          ? `Saved. ${skipped.length} step(s) kept (have leads): ${skipped.join(', ')}`
          : 'All steps saved',
      });
    } catch (_) {
      // saveError in slice
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        duration={toast.message.length > 60 ? 8000 : 3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <header>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          System Configuration
        </h1>
        <p className="mt-0.5 text-xs text-slate-500"></p>
      </header>

      {isError && (
        <Alert tone="error" title="Couldn't load stages">
          <div className="flex items-center justify-between gap-3">
            <span>{error?.message || 'Please try again.'}</span>
            <button
              type="button"
              onClick={reload}
              className="rounded-md border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </Alert>
      )}

      {saveError?.message && (
        <Alert tone="error" title="Couldn't save">
          {saveError.message}
        </Alert>
      )}

      {/* Steps section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
            Sales Process Steps
          </p>
          {dirty && !isLoading && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              Unsaved changes
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" rounded="rounded-xl" />
            ))}
          </div>
        ) : draft.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-700">No steps yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Add steps below, or reset to the default CRM stages.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {draft.map((step, index) => (
              <StepCard
                key={step.key}
                step={step}
                index={index}
                total={draft.length}
                onEdit={editStep}
                onDelete={deleteStep}
                onMove={moveStep}
              />
            ))}
          </div>
        )}

        {canManage && <AddStepBar onAdd={addStep} />}
      </section>

      {/* Bottom actions */}
      {canManage && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={saving}
            className="!rounded-md !px-3 !py-2 !text-xs"
          >
            Reset to Original ({DEFAULT_STAGES.length} steps)
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={saving || isLoading}
            className="!rounded-md !px-4 !py-2 !text-xs"
          >
            Save All Steps
          </Button>
        </div>
      )}

      <InstructionsCard />
    </div>
  );
}
