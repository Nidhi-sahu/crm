import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { enquiryService } from '../modules/crm/enquiries/services/enquiryService';
import { leadsService } from '../modules/crm/leads/services/leadsService';
import { setFilter as setEnquiryFilter } from '../modules/crm/enquiries/redux/enquirySlice';
import { setFilter as setLeadFilter } from '../modules/crm/leads/redux/leadsSlice';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const Spinner = () => (
  <svg className="h-3.5 w-3.5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
  </svg>
);

export function GlobalSearch() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ enquiries: [], leads: [] });
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click.
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search across enquiries + leads. Each call is independent so a
  // role that lacks one permission (e.g. no lead:read) still gets the other.
  // All state updates happen inside the timeout (or the onChange handler) — never
  // synchronously in the effect body — to avoid cascading re-renders.
  useEffect(() => {
    const q = term.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) return undefined;
    let active = true;
    debounceRef.current = setTimeout(async () => {
      const [enquiries, leads] = await Promise.all([
        enquiryService.list({ search: q, limit: 5 }).then((r) => r.items || []).catch(() => []),
        leadsService.list({ search: q, limit: 5 }).then((r) => r.items || []).catch(() => []),
      ]);
      if (!active) return;
      setResults({ enquiries, leads });
      setLoading(false);
    }, 300);
    return () => {
      active = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term]);

  // Immediate UI feedback lives in the input handler (an event handler, not an
  // effect): show the spinner for a fresh query, or clear when the term is short.
  const handleChange = (e) => {
    const v = e.target.value;
    setTerm(v);
    setOpen(true);
    if (v.trim().length < 2) {
      setResults({ enquiries: [], leads: [] });
      setLoading(false);
    } else {
      setLoading(true);
    }
  };

  const goEnquiries = (q) => {
    dispatch(setEnquiryFilter({ search: q }));
    navigate('/app/enquiries');
    setOpen(false);
    setTerm('');
  };

  const goLeads = (q) => {
    dispatch(setLeadFilter({ search: q }));
    navigate('/app/leads');
    setOpen(false);
    setTerm('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (q.length < 1) return;
    goEnquiries(q);
  };

  const hasResults = results.enquiries.length > 0 || results.leads.length > 0;
  const showDropdown = open && term.trim().length >= 2;

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <form onSubmit={onSubmit} className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-slate-400">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={term}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder="Search leads, enquiries…"
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </form>

      {showDropdown && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-card">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-500">
              <Spinner /> Searching…
            </div>
          )}

          {!loading && !hasResults && (
            <div className="px-4 py-3 text-xs text-slate-500">
              No matches for “{term.trim()}”.
            </div>
          )}

          {!loading && results.enquiries.length > 0 && (
            <div>
              <p className="px-4 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Enquiries
              </p>
              {results.enquiries.map((e) => (
                <button
                  key={e._id}
                  type="button"
                  onClick={() => goEnquiries(e.clientName || term.trim())}
                  className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {e.clientName || 'Unnamed'}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500">
                      {[e.clientPhone, e.project].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600">
                    Enquiry
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.leads.length > 0 && (
            <div>
              <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Leads
              </p>
              {results.leads.map((l) => {
                const enq = l.enquiryId || {};
                return (
                  <button
                    key={l._id}
                    type="button"
                    onClick={() => goLeads(enq.clientName || term.trim())}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {enq.clientName || 'Unnamed'}
                      </span>
                      <span className="block truncate text-[11px] text-slate-500">
                        {[enq.clientPhone, l.currentStageId?.name].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                      Lead
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
