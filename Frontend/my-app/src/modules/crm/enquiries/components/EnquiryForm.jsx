import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../../../shared/components/Input';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Textarea } from '../../../../shared/components/Textarea';
import { Alert } from '../../../../shared/components/Alert';
import { ENQUIRY_SOURCES } from '../constants/enquirySources';
import { enquiryService } from '../services/enquiryService';
import { leadsService } from '../../leads/services/leadsService';
import { brokersService } from '../../brokers/services/brokersService';
import {
  enquiryRules,
  defaultEnquiryValues,
  enquiryToFormValues,
  formValuesToPayload,
} from '../validations/enquirySchema';

const VISIT_NUMBER_OPTIONS = [
  { value: '1st', label: '1st Visit' },
  { value: '2nd', label: '2nd Visit' },
  { value: '3rd', label: '3rd Visit' },
  { value: '4th+', label: '4th+ Visit' },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

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
    watch,
    formState: { errors, isDirty },
  } = useForm({
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  // 'none' | 'idle' (allow with warning) | 'active' (block)
  const [phoneDup, setPhoneDup] = useState('none');
  const [walkIn, setWalkIn] = useState({
    visitDate: todayISO(),
    salesPersonName: '',
    propertyInterested: '',
    firstPreference: '',
    secondPreference: '',
    customerProfession: '',
    customerAddress: '',
    customerBudget: '',
    visitNumber: '1st',
    photoUrl: '',
  });
  const [uploading, setUploading] = useState(false);
  const phoneValue = watch('clientPhone');
  const sourceValue = watch('source');
  const isWalkIn = sourceValue === 'walkIn';
  const isBrokerSource = sourceValue === 'broker';

  // Registered brokers — shown as type-ahead suggestions in the Broker Name field.
  const [brokers, setBrokers] = useState([]);
  useEffect(() => {
    if (!isBrokerSource) return;
    brokersService.list().then(setBrokers).catch(() => setBrokers([]));
  }, [isBrokerSource]);

  // Team members for initial-stage allocation (Tele Sales / Sales / Visit).
  const [teleSalesUsers, setTeleSalesUsers] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [visitPersons, setVisitPersons] = useState([]);
  useEffect(() => {
    leadsService.listTeleSalesUsers().then(setTeleSalesUsers).catch(() => setTeleSalesUsers([]));
    leadsService.listSalesPersons().then(setSalesPersons).catch(() => setSalesPersons([]));
    leadsService.listVisitTeamMembers().then(setVisitPersons).catch(() => setVisitPersons([]));
  }, []);

  const userOptions = (list) =>
    list.map((u) => ({ value: u._id, label: u.name || u.email }));

  const setWalk = (key) => (e) =>
    setWalkIn((w) => ({ ...w, [key]: e.target.value }));

  const handleWalkPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await leadsService.uploadVisitPhoto(file);
      setWalkIn((w) => ({ ...w, photoUrl: url }));
    } catch (_) {
      // silent — user can retry
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const phone = (phoneValue || '').trim();
    if (isWalkIn || phone.length < 7) {
      setPhoneDup('none');
      return undefined;
    }
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await enquiryService.checkPhone(phone, initialEnquiry?._id);
        if (!active) return;
        if (!res.exists) setPhoneDup('none');
        else if (res.idle) setPhoneDup('idle');
        else setPhoneDup('active');
      } catch (_) {
        if (active) setPhoneDup('none');
      }
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [phoneValue, initialEnquiry?._id, isWalkIn]);

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
    if (!isWalkIn && phoneDup === 'active') {
      setError('clientPhone', { type: 'duplicate', message: 'This number already exists' });
      return;
    }
    if (isWalkIn) {
      onSubmit({
        __walkIn: true,
        clientName: (values.clientName || '').trim(),
        clientEmail: (values.clientEmail || '').trim(),
        companyName: (values.companyName || '').trim(),
        requirement: (values.requirement || '').trim(),
        project: '',
        budget: 0,
        visitDate: walkIn.visitDate || todayISO(),
        visitReport: {
          visitedAt: walkIn.visitDate || todayISO(),
          customerName: (values.clientName || '').trim(),
          salesPersonName: walkIn.salesPersonName.trim(),
          propertyInterested: walkIn.propertyInterested.trim(),
          firstPreference: walkIn.firstPreference.trim(),
          secondPreference: walkIn.secondPreference.trim(),
          customerBudget: walkIn.customerBudget.trim(),
          customerProfession: walkIn.customerProfession.trim(),
          customerAddress: walkIn.customerAddress.trim(),
          sourceOfCustomer: 'Walk-in',
          visitNumber: walkIn.visitNumber,
          photoUrl: walkIn.photoUrl,
        },
      });
      return;
    }
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
          {!isWalkIn && (
            <div>
              <Input
                label="Phone Number *"
                placeholder="+91 98765 43210"
                error={errors.clientPhone?.message || (phoneDup === 'active' ? 'This number already exists' : undefined)}
                {...register('clientPhone', enquiryRules.clientPhone)}
              />
              {phoneDup === 'idle' && (
                <p className="mt-1 text-[11px] font-medium text-amber-700">
                  ⚠ This number was previously added but the lead is idle. You can still
                  add — the new lead will show a “previously associated” note.
                </p>
              )}
            </div>
          )}
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
          <Input
            label="Client City"
            placeholder="e.g. Raipur"
            {...register('city')}
          />
          <SelectInput
            label="Occupation"
            placeholder="Select occupation"
            options={[
              { value: 'Government Job', label: 'Government Job' },
              { value: 'Private Job', label: 'Private Job' },
              { value: 'Business', label: 'Business' },
            ]}
            {...register('occupation')}
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
            label="Source of Lead *"
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
        {sourceValue === 'broker' && (
          <>
            <Input
              label="Broker Name *"
              placeholder="Select a broker or type a name"
              list="broker-suggestions"
              autoComplete="off"
              error={errors.brokerName?.message}
              {...register('brokerName', {
                validate: (v) =>
                  sourceValue !== 'broker' || (v && v.trim().length > 0) || "Broker's name is required",
              })}
            />
            <datalist id="broker-suggestions">
              {brokers.map((b) => (
                <option key={b._id} value={b.name} />
              ))}
            </datalist>
          </>
        )}
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

      {!isWalkIn && (
        <>
          <div className="border-t border-slate-100" />
          <section className="space-y-3">
            <SectionHeader>Assignment (optional)</SectionHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SelectInput
                label="Tele Sales Executive"
                placeholder="Select Tele Sales"
                options={userOptions(teleSalesUsers)}
                {...register('teleSalesExecutive')}
              />
              <SelectInput
                label="Sales Person"
                placeholder="Select Sales Person"
                options={userOptions(salesPersons)}
                {...register('salesPerson')}
              />
              <SelectInput
                label="Visit Person"
                placeholder="Select Visit Person"
                options={userOptions(visitPersons)}
                {...register('visitPerson')}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Allocate this enquiry from the start — these stay visible across the lead lifecycle.
            </p>
          </section>
        </>
      )}

      {isWalkIn && (
        <>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            🚶 <strong>Walk-in client</strong> — phone not required. On save, this will create the lead directly at <strong>Feedback Call</strong> stage (visit already done).
          </div>
          <div className="border-t border-slate-100" />
          <section className="space-y-3">
            <SectionHeader>Visit Details</SectionHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                type="date"
                label="Visit Date *"
                value={walkIn.visitDate}
                onChange={setWalk('visitDate')}
              />
              <SelectInput
                label="Visit Number"
                options={VISIT_NUMBER_OPTIONS}
                value={walkIn.visitNumber}
                onChange={setWalk('visitNumber')}
              />
              <Input
                label="Property Interested"
                placeholder="e.g. 3 BHK"
                value={walkIn.propertyInterested}
                onChange={setWalk('propertyInterested')}
              />
              <Input
                label="First Preference (Primary Villa)"
                placeholder="e.g. Villa A"
                value={walkIn.firstPreference}
                onChange={setWalk('firstPreference')}
              />
              <Input
                label="Second Preference (Secondary Villa)"
                placeholder="e.g. Villa B"
                value={walkIn.secondPreference}
                onChange={setWalk('secondPreference')}
              />
              <Input
                label="Sales Person"
                placeholder="Who attended"
                value={walkIn.salesPersonName}
                onChange={setWalk('salesPersonName')}
              />
              <Input
                label="Customer Budget"
                placeholder="e.g. ₹50–80 Lakh"
                value={walkIn.customerBudget}
                onChange={setWalk('customerBudget')}
              />
              <Input
                label="Customer Profession"
                placeholder="e.g. Software Engineer"
                value={walkIn.customerProfession}
                onChange={setWalk('customerProfession')}
              />
            </div>
            <Textarea
              label="Customer Address"
              rows={2}
              value={walkIn.customerAddress}
              onChange={setWalk('customerAddress')}
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Photo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleWalkPhoto}
                disabled={uploading}
                className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 hover:file:bg-brand-200"
              />
              {uploading && <p className="mt-1 text-[11px] text-slate-500">Uploading…</p>}
              {walkIn.photoUrl && (
                <p className="mt-1 text-[11px] text-emerald-600">Photo uploaded ✓</p>
              )}
            </div>
          </section>
        </>
      )}
    </form>
  );
}
