import { Textarea } from '../../../../shared/components/Textarea';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Input } from '../../../../shared/components/Input';

const fieldName = (q) => `answers.${q.id}`;

const hasBank = (b) =>
  !!b &&
  (b.bankName || b.accountHolderName || b.accountNumber || b.ifscCode || b.branch || b.upiId);

const BankDetailsCard = ({ bank }) => (
  <div className="mt-2 rounded-lg border border-brand-200 bg-brand-50/50 p-3 text-xs">
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
      Project Bank Account
    </p>
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {bank.bankName && (
        <div>
          <span className="text-slate-500">Bank: </span>
          <span className="font-medium text-slate-800">{bank.bankName}</span>
        </div>
      )}
      {bank.accountHolderName && (
        <div>
          <span className="text-slate-500">Holder: </span>
          <span className="font-medium text-slate-800">{bank.accountHolderName}</span>
        </div>
      )}
      {bank.accountNumber && (
        <div>
          <span className="text-slate-500">A/c #: </span>
          <span className="font-mono font-medium text-slate-800">{bank.accountNumber}</span>
        </div>
      )}
      {bank.ifscCode && (
        <div>
          <span className="text-slate-500">IFSC: </span>
          <span className="font-mono font-medium text-slate-800">{bank.ifscCode}</span>
        </div>
      )}
      {bank.branch && (
        <div>
          <span className="text-slate-500">Branch: </span>
          <span className="font-medium text-slate-800">{bank.branch}</span>
        </div>
      )}
      {bank.accountType && (
        <div>
          <span className="text-slate-500">Type: </span>
          <span className="font-medium text-slate-800">{bank.accountType}</span>
        </div>
      )}
      {bank.upiId && (
        <div className="sm:col-span-2">
          <span className="text-slate-500">UPI: </span>
          <span className="font-mono font-medium text-slate-800">{bank.upiId}</span>
        </div>
      )}
    </div>
  </div>
);

export function QuestionRenderer({ question, register, watch, projectOptions = [], projects = [] }) {
  const id = `q-${question.id}`;
  const name = fieldName(question);

  // "Preferred location?" → pick from company projects.
  const isProjectLocation =
    question.id === 'location' || /location/i.test(question.text || '');
  if (isProjectLocation) {
    const locationOptions = [
      { value: '', label: projectOptions.length ? 'Select a project' : 'No projects added yet' },
      ...projectOptions,
    ];
    const selectedName = watch ? watch(name) : '';
    const selectedProject = projects.find((p) => p.name === selectedName);
    const showBank = selectedProject && hasBank(selectedProject.bankDetails);
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {question.text}
        </label>
        <SelectInput
          id={id}
          options={locationOptions}
          className="!py-1.5 !text-sm"
          {...register(name)}
        />
        {showBank && <BankDetailsCard bank={selectedProject.bankDetails} />}
        {selectedProject && !showBank && (
          <p className="mt-1 text-[11px] italic text-slate-400">
            No bank details added for this project yet.
          </p>
        )}
      </div>
    );
  }

  if (question.type === 'select') {
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {question.text}
        </label>
        <SelectInput
          id={id}
          placeholder="Select…"
          options={(question.options || []).map((o) => ({ value: o, label: o }))}
          className="!py-1.5 !text-sm"
          {...register(name)}
        />
      </div>
    );
  }

  if (question.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {question.text}
        </label>
        <Textarea id={id} rows={2} {...register(name)} />
      </div>
    );
  }

  if (question.type === 'checkbox') {
    const opts = question.options || ['Yes'];
    return (
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-slate-800">{question.text}</p>
        <div className="flex flex-wrap gap-2">
          {opts.map((opt) => (
            <label
              key={opt}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-100 has-[:checked]:text-brand-700"
            >
              <input
                type="checkbox"
                value={opt}
                className="h-3.5 w-3.5 accent-brand-600"
                {...register(`${name}.${opt}`)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === 'radio') {
    return (
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-slate-800">{question.text}</p>
        <div className="flex flex-wrap gap-2">
          {(question.options || []).map((opt) => (
            <label
              key={opt}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-100 has-[:checked]:text-brand-700"
            >
              <input
                type="radio"
                value={opt}
                className="h-3.5 w-3.5 accent-brand-600"
                {...register(name)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  // text default
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {question.text}
      </label>
      <Input id={id} placeholder="Your answer" {...register(name)} />
    </div>
  );
}
