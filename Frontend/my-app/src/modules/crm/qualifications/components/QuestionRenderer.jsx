import { Textarea } from '../../../../shared/components/Textarea';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Input } from '../../../../shared/components/Input';

const fieldName = (q) => `answers.${q.id}`;

export function QuestionRenderer({ question, register, projectOptions = [] }) {
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
