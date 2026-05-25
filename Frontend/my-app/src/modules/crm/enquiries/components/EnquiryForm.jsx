import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../../../shared/components/Input';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Textarea } from '../../../../shared/components/Textarea';
import { Alert } from '../../../../shared/components/Alert';
import { ENQUIRY_SOURCES } from '../constants/enquirySources';
import {
  enquiryRules,
  defaultEnquiryValues,
  enquiryToFormValues,
  formValuesToPayload,
} from '../validations/enquirySchema';

const SectionHeader = ({ children }) => (
  <div className="flex items-center gap-2">
    <span className="h-3.5 w-1 rounded-full bg-brand-500" aria-hidden="true" />
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
      {children}
    </h3>
  </div>
);

export function EnquiryForm({ formId, initialEnquiry = null, serverError, onSubmit, onDirtyChange }) {
  const initialValues = initialEnquiry
    ? enquiryToFormValues(initialEnquiry)
    : { ...defaultEnquiryValues };

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEnquiry?._id]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!serverError?.details) return;
    serverError.details.forEach((d) => {
      if (d.field) setError(d.field, { type: 'server', message: d.message });
    });
  }, [serverError, setError]);

  const submit = handleSubmit((values) => {
    onSubmit(formValuesToPayload(values));
  });

  return (
    <form id={formId} onSubmit={submit} className="space-y-5" noValidate>
      {serverError?.message && !serverError.details?.length && (
        <Alert tone="error" title="Couldn't save">
          {serverError.message}
        </Alert>
      )}

      {/* CLIENT INFORMATION */}
      <section className="space-y-3">
        <SectionHeader>Client Information</SectionHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Client Name *"
            placeholder="e.g. Ramesh Sharma"
            error={errors.clientName?.message}
            {...register('clientName', enquiryRules.clientName)}
          />
          <Input
            label="Phone Number *"
            placeholder="+91 98765 43210"
            error={errors.clientPhone?.message}
            {...register('clientPhone', enquiryRules.clientPhone)}
          />
          <Input
            label="Company Name"
            placeholder="Optional"
            error={errors.companyName?.message}
            {...register('companyName', enquiryRules.companyName)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="ramesh@example.com"
            error={errors.clientEmail?.message}
            {...register('clientEmail', enquiryRules.clientEmail)}
          />
        </div>
      </section>

      <div className="border-t border-slate-100" />

      {/* ENQUIRY DETAILS */}
      <section className="space-y-3">
        <SectionHeader>Enquiry Details</SectionHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="Date of Enquiry"
            type="date"
            {...register('dateOfEnquiry')}
          />
          <SelectInput
            label="Source *"
            placeholder="Select source"
            options={ENQUIRY_SOURCES}
            error={errors.source?.message}
            {...register('source', enquiryRules.source)}
          />
          <Input
            label="Followup Date"
            type="date"
            {...register('nextFollowupAt')}
          />
        </div>
        <Textarea
          label="Remark"
          rows={3}
          placeholder="Any additional notes about this enquiry…"
          error={errors.remarks?.message}
          {...register('remarks', enquiryRules.remarks)}
        />
      </section>

      <div className="border-t border-slate-100" />

      {/* REQUIREMENT */}
      <section className="space-y-3">
        <SectionHeader>Requirement Details</SectionHeader>
        <Textarea
          rows={3}
          placeholder="What is the client looking for? (project, budget, timeline, …)"
          error={errors.requirement?.message}
          {...register('requirement', enquiryRules.requirement)}
        />
      </section>
    </form>
  );
}
