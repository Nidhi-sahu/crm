import { useState } from 'react';
import { Button } from '../../../../shared/components/Button';

export function AddStepBar({ onAdd }) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder="Enter step name (e.g., Initial Contact, Proposal Sent, etc.)"
        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      <Button
        variant="primary"
        onClick={submit}
        disabled={value.trim().length < 2}
        className="!rounded-md !px-3 !py-2 !text-xs"
      >
        + Add Step
      </Button>
    </div>
  );
}
