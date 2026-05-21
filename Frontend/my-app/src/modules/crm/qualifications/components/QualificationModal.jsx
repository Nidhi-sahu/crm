import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { Textarea } from '../../../../shared/components/Textarea';
import { Alert } from '../../../../shared/components/Alert';
import { useQualification } from '../hooks/useQualification';
import { useAuth } from '../../auth/hooks/useAuth';
import { PERMISSIONS } from '../../auth/constants/permissions';
import { QuestionRenderer } from './QuestionRenderer';
import { TemperatureSelector } from './TemperatureSelector';
import { StatusSelector } from './StatusSelector';
import { QualificationTimeline } from './QualificationTimeline';
import {
  QUALIFICATION_STATUS,
  TEMPERATURES,
} from '../constants/qualificationStatuses';

const SectionHeader = ({ number, children }) => (
  <div className="flex items-center gap-2">
    {number != null && (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
        {number}
      </span>
    )}
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
      {children}
    </h3>
  </div>
);

const cardClass = 'space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft';

const InfoRow = ({ label, value }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm text-slate-800 break-words">
      {value || <span className="text-slate-300">—</span>}
    </p>
  </div>
);

const isoDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const isoTimeInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
};

const FORM_ID = 'qualification-form';

export function QualificationModal({ open, enquiry, onClose, onSubmitted }) {
  const { can } = useAuth();
  const canCreate = can(PERMISSIONS.qualification.create);
  const {
    questions,
    questionsLoading,
    existing,
    saving,
    saveError,
    submit,
    clearSaveError,
  } = useQualification(enquiry?._id, open);

  const isFinalized =
    existing &&
    existing.qualificationStatus &&
    existing.qualificationStatus !== 'pending';

  const initialAnswers = (() => {
    const map = {};
    (existing?.answers || []).forEach((a) => {
      if (a?.questionId) map[a.questionId] = a.answer;
    });
    return map;
  })();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      requirement: enquiry?.requirement || '',
      answers: initialAnswers,
      temperature: existing?.leadTemperature || TEMPERATURES.COLD,
      status: '',
      remarks: existing?.remarks || '',
      reminderDate: isoDateInput(existing?.nextFollowupAt),
      reminderTime: isoTimeInput(existing?.nextFollowupAt),
      rejectionReason: '',
      holdUntil: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      requirement: enquiry?.requirement || '',
      answers: initialAnswers,
      temperature: existing?.leadTemperature || TEMPERATURES.COLD,
      status: '',
      remarks: existing?.remarks || '',
      reminderDate: isoDateInput(existing?.nextFollowupAt),
      reminderTime: isoTimeInput(existing?.nextFollowupAt),
      rejectionReason: '',
      holdUntil: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, enquiry?._id, existing?._id]);

  useEffect(() => () => clearSaveError(), [clearSaveError]);

  if (!enquiry) return null;

  if (!canCreate) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Restricted"
        width="max-w-md"
        footer={
          <div className="flex items-center justify-end">
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        }
      >
        <Alert tone="error" title="Permission needed">
          You don&apos;t have the <code>qualification:create</code> permission.
        </Alert>
      </Modal>
    );
  }

  const status = watch('status');
  const requirement = watch('requirement');

  const onValid = async (values) => {
    const answersArray = (questions || [])
      .map((q) => {
        const raw = values.answers?.[q.id];
        let answer = raw;
        if (q.type === 'checkbox' && raw && typeof raw === 'object') {
          answer = Object.entries(raw)
            .filter(([, v]) => Boolean(v))
            .map(([k]) => k)
            .join(', ');
        }
        if (!answer && answer !== 0) return null;
        const typeMap = { select: 'dropdown' };
        return {
          questionId: q.id,
          questionText: q.text,
          questionType: typeMap[q.type] || q.type || 'text',
          answer: String(answer),
        };
      })
      .filter(Boolean);

    let nextFollowupAt = null;
    if (values.reminderDate) {
      const [y, m, d] = values.reminderDate.split('-').map(Number);
      const dt = new Date(y, (m || 1) - 1, d || 1);
      if (values.reminderTime) {
        const [hh, mm] = values.reminderTime.split(':').map(Number);
        dt.setHours(hh || 0, mm || 0, 0, 0);
      }
      nextFollowupAt = dt.toISOString();
    }

    try {
      await submit({
        enquiry,
        requirement: values.requirement,
        payload: {
          answers: answersArray,
          leadTemperature: values.temperature,
          remarks: values.remarks?.trim() || '',
          nextFollowupAt,
        },
        status: values.status,
        rejectionReason: values.rejectionReason?.trim() || '',
        holdUntil: values.holdUntil || null,
      });
      onSubmitted?.();
      onClose?.();
    } catch (_) {
      // saveError is set in redux
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Qualification"
      subtitle={isFinalized ? `Current status: ${existing.qualificationStatus}` : 'Capture qualification details for this enquiry'}
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          {!isFinalized && (
            <Button
              type="submit"
              form={FORM_ID}
              variant="primary"
              loading={saving}
              disabled={saving}
            >
              Submit Qualification
            </Button>
          )}
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onValid)} noValidate className="space-y-4">
        {saveError?.message && (
          <Alert tone="error" title="Couldn't submit">
            {saveError.message}
          </Alert>
        )}

        {isFinalized && (
          <Alert tone="info" title="Already finalized">
            This enquiry already has a qualification recorded — read-only view.
          </Alert>
        )}

        {/* Section 1 — Client Information */}
        <section className={cardClass}>
          <SectionHeader number={1}>Client Information</SectionHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InfoRow label="Client Name" value={enquiry.clientName} />
            <InfoRow label="Phone Number" value={enquiry.clientPhone} />
            <InfoRow label="Email Address" value={enquiry.clientEmail} />
          </div>
        </section>

        {/* Section 2 — Requirement Details */}
        <section className={cardClass}>
          <SectionHeader number={2}>Requirement Details</SectionHeader>
          <Textarea
            rows={3}
            placeholder="Client requirement…"
            disabled={isFinalized}
            {...register('requirement')}
          />
          {requirement?.trim() !== (enquiry.requirement || '').trim() && !isFinalized && (
            <p className="text-[11px] text-slate-500">
              Changes here will also update the enquiry record.
            </p>
          )}
        </section>

        {/* Section 3 — Qualification Questions */}
        <section className={cardClass}>
          <SectionHeader number={3}>Qualification Questions</SectionHeader>
          {questionsLoading ? (
            <p className="text-xs text-slate-500">Loading questions…</p>
          ) : questions.length === 0 ? (
            <p className="text-xs text-slate-500">No questions configured.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {questions.map((q) => (
                <QuestionRenderer key={q.id} question={q} register={register} />
              ))}
            </div>
          )}
        </section>

        {/* Section 4 — Lead Temperature */}
        <section className={cardClass}>
          <SectionHeader number={4}>Lead Temperature</SectionHeader>
          <Controller
            control={control}
            name="temperature"
            render={({ field }) => (
              <TemperatureSelector value={field.value} onChange={field.onChange} />
            )}
          />
        </section>

        {!isFinalized && (
          <>
            {/* Section 5 — Qualification Status */}
            <section className={cardClass}>
              <SectionHeader number={5}>Qualification Status *</SectionHeader>
              <Controller
                control={control}
                name="status"
                rules={{ required: 'Please choose a status' }}
                render={({ field }) => (
                  <StatusSelector
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.status?.message}
                  />
                )}
              />

              {status === QUALIFICATION_STATUS.NOT_QUALIFIED && (
                <Textarea
                  label="Rejection Reason *"
                  rows={2}
                  placeholder="Why is this lead being rejected?"
                  error={errors.rejectionReason?.message}
                  {...register('rejectionReason', {
                    required:
                      status === QUALIFICATION_STATUS.NOT_QUALIFIED
                        ? 'Reason is required'
                        : false,
                  })}
                />
              )}

              {(status === QUALIFICATION_STATUS.HOLD ||
                status === QUALIFICATION_STATUS.FUTURE_PROSPECT) && (
                <Input
                  label="Hold Until (optional)"
                  type="date"
                  {...register('holdUntil')}
                />
              )}
            </section>

            {/* Section 6 — Comment / Notes */}
            <section className={cardClass}>
              <SectionHeader number={6}>Comment &amp; Notes</SectionHeader>
              <Textarea
                rows={3}
                placeholder="Followup notes, observations, remarks…"
                {...register('remarks')}
              />
            </section>

            {/* Section 7 — Reminder */}
            <section className={cardClass}>
              <SectionHeader number={7}>Reminder</SectionHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input label="Reminder Date" type="date" {...register('reminderDate')} />
                <Input label="Reminder Time" type="time" {...register('reminderTime')} />
              </div>
            </section>
          </>
        )}

        {/* Section 8 — Timeline */}
        <section className={cardClass}>
          <SectionHeader number={isFinalized ? 5 : 8}>Activity Timeline</SectionHeader>
          <QualificationTimeline enquiry={enquiry} qualification={existing} />
        </section>
      </form>
    </Modal>
  );
}
