import { useMemo, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Alert } from '../../../../shared/components/Alert';
import { extractApiError } from '../../../../shared/api/axiosClient';
import { IMPORT_SOURCE_OPTIONS } from '../constants/importSources';
import { parseLeadsText } from '../utils/bulkImportParser';
import { enquiryService } from '../services/enquiryService';
import { BulkDistributePanel } from './BulkDistributePanel';

const PREVIEW_LIMIT = 50;

const normName = (r) => (r.name || r.clientName || '').trim();
const normPhone = (r) => (r.phone || r.clientPhone || '').trim();

const buildAssignments = (leadIds, allocations) => {
  const out = [];
  let idx = 0;
  allocations.forEach(({ userId, count }) => {
    for (let i = 0; i < count && idx < leadIds.length; i += 1) {
      out.push({ enquiryId: leadIds[idx], userId });
      idx += 1;
    }
  });
  return out;
};

export function BulkImportModal({ open, onClose, onImported, onDistributed }) {
  const [step, setStep] = useState('import'); // 'import' | 'result' | 'distribute'
  const [source, setSource] = useState('metaAds');
  const [rawText, setRawText] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

  const rows = useMemo(() => parseLeadsText(rawText), [rawText]);

  const { validRows, dupPhones, invalidCount } = useMemo(() => {
    const seen = new Set();
    const dups = new Set();
    const valid = [];
    let invalid = 0;
    rows.forEach((r) => {
      const name = normName(r);
      const phone = normPhone(r);
      if (!name || !phone) {
        invalid += 1;
        return;
      }
      if (seen.has(phone)) {
        dups.add(phone);
        return;
      }
      seen.add(phone);
      valid.push(r);
    });
    return { validRows: valid, dupPhones: dups, invalidCount: invalid };
  }, [rows]);

  const reset = () => {
    setStep('import');
    setSource('metaAds');
    setRawText('');
    setResult(null);
    setError(null);
    setImporting(false);
    setAssigning(false);
    setAssignError(null);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setRawText(text);
    } catch (_) {
      setError({ message: 'Could not read the file. Try pasting the rows instead.' });
    } finally {
      e.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!validRows.length) return;
    setImporting(true);
    setError(null);
    try {
      const res = await enquiryService.bulkImport({ source, rows: validRows });
      setResult(res);
      onImported?.(res);
      setStep(res?.created?.length ? 'distribute' : 'result');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setImporting(false);
    }
  };

  const handleAssign = async (allocations) => {
    const leadIds = (result?.created || []).map((l) => l._id).filter(Boolean);
    const assignments = buildAssignments(leadIds, allocations);
    if (!assignments.length) return;
    setAssigning(true);
    setAssignError(null);
    try {
      const res = await enquiryService.bulkAssign(assignments);
      onDistributed?.({ ...res, assigned: assignments.length });
      handleClose();
    } catch (err) {
      setAssignError(extractApiError(err));
    } finally {
      setAssigning(false);
    }
  };

  const previewRows = rows.slice(0, PREVIEW_LIMIT);

  const footer = (() => {
    if (step === 'result') {
      return (
        <div className="flex items-center justify-end">
          <Button variant="primary" onClick={handleClose} className="!rounded-md !px-4 !py-1.5 !text-xs">
            Done
          </Button>
        </div>
      );
    }
    if (step === 'distribute') return null; // panel provides its own actions
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">
          {validRows.length} ready · {dupPhones.size} dup · {invalidCount} invalid
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            loading={importing}
            disabled={importing || validRows.length === 0}
            className="!gap-1.5 !rounded-md !px-3 !py-1.5 !text-xs"
          >
            Import {validRows.length || ''} leads
          </Button>
        </div>
      </div>
    );
  })();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Bulk Import Leads"
      subtitle="Import from Meta Ads, Housing, Facebook or CSV — duplicate phones are skipped"
      width="max-w-2xl"
      footer={footer}
    >
      {step === 'distribute' && (
        <div className="space-y-4">
          <Alert tone="success" title="Import complete">
            {result?.summary?.created} created · {result?.summary?.skipped} skipped — now distribute them.
          </Alert>
          <BulkDistributePanel
            total={result?.created?.length || 0}
            assigning={assigning}
            assignError={assignError}
            onAssign={handleAssign}
            onSkip={handleClose}
          />
        </div>
      )}

      {step === 'result' && <ResultView result={result} />}

      {step === 'import' && (
        <div className="space-y-4">
          {error?.message && <Alert tone="error" title="Import failed">{error.message}</Alert>}

          <div>
            <label className="field-label">Source platform</label>
            <SelectInput
              options={IMPORT_SOURCE_OPTIONS}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <label className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50">
            <input type="file" accept=".csv,.txt,text/csv" onChange={handleFile} className="hidden" />
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 16V4m0 0L8 8m4-4 4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-sm font-medium text-slate-700">Click to upload a CSV file</span>
            <span className="text-[11px] text-slate-400">Columns: Name, Phone, Email, City…</span>
          </label>

          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or paste rows
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={'Name, Phone, Email\nRaj Mehta, 9876543210, raj@mail.com\nPriya Shah, 9123456780'}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[12px] text-slate-800 placeholder:text-slate-300 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              First row can be headers (Name, Phone, Email…), or paste plain rows — first two columns
              are treated as Name and Phone.
            </p>
          </div>

          {rows.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Preview · {rows.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    {validRows.length} ready
                  </span>
                  {dupPhones.size > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      {dupPhones.size} dup
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600">
                      {invalidCount} invalid
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full text-[12px]">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400">
                      <th className="px-3 py-1.5">Name</th>
                      <th className="px-3 py-1.5">Phone</th>
                      <th className="px-3 py-1.5">Email</th>
                      <th className="px-3 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((r, i) => {
                      const name = normName(r);
                      const phone = normPhone(r);
                      const invalid = !name || !phone;
                      const dup = !invalid && dupPhones.has(phone);
                      return (
                        <tr key={`${phone}-${i}`} className={invalid || dup ? 'bg-amber-50/50' : ''}>
                          <td className="px-3 py-1.5 text-slate-700">{name || <span className="text-slate-300">—</span>}</td>
                          <td className="px-3 py-1.5 font-mono text-slate-700">{phone || <span className="text-slate-300">—</span>}</td>
                          <td className="px-3 py-1.5 text-slate-500">{(r.email || r.clientEmail) || <span className="text-slate-300">—</span>}</td>
                          <td className="px-3 py-1.5">
                            {invalid ? (
                              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600">missing name/phone</span>
                            ) : dup ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">duplicate in file</span>
                            ) : (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">ready</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function ResultView({ result }) {
  const { summary = {}, skipped = [] } = result || {};
  return (
    <div className="space-y-4">
      <Alert tone="success" title="Import complete">
        {summary.created} created · {summary.skipped} skipped (of {summary.received} rows)
      </Alert>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Received" value={summary.received} tone="text-slate-700" />
        <Stat label="Created" value={summary.created} tone="text-emerald-600" />
        <Stat label="Skipped" value={summary.skipped} tone="text-amber-600" />
      </div>

      {skipped.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Skipped ({skipped.length})
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
            {skipped.map((s, i) => (
              <div key={`${s.phone}-${i}`} className="flex items-center justify-between gap-3 px-3 py-1.5 text-[12px]">
                <span className="truncate text-slate-700">
                  {s.name || '—'} <span className="font-mono text-slate-400">{s.phone || ''}</span>
                </span>
                <span className="shrink-0 text-[11px] text-amber-700">{s.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white py-2">
      <p className={`text-lg font-semibold ${tone}`}>{value ?? 0}</p>
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}
