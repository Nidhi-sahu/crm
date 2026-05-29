import { useCallback, useEffect, useMemo, useState } from 'react';
import { ENQUIRY_COLUMNS, ENQUIRY_COLUMN_STORAGE_KEY } from '../constants/enquiryColumns';

const buildDefault = () =>
  ENQUIRY_COLUMNS.map((c) => ({
    key: c.key,
    label: c.label,
    visible: true,
    custom: false,
    sortable: !!c.sortable,
    sortKey: c.sortKey,
    align: c.align,
    hideable: c.hideable !== false,
  }));

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(ENQUIRY_COLUMN_STORAGE_KEY));
    if (!Array.isArray(saved) || !saved.length) return buildDefault();
    const base = buildDefault();
    const byKey = Object.fromEntries(base.map((c) => [c.key, c]));
    const merged = saved
      .map((s) => {
        if (s.custom) {
          return {
            key: s.key,
            label: s.label,
            visible: s.visible !== false,
            custom: true,
            sortable: false,
            hideable: true,
          };
        }
        const b = byKey[s.key];
        return b ? { ...b, label: s.label || b.label, visible: s.visible !== false } : null;
      })
      .filter(Boolean);
    const present = new Set(merged.map((c) => c.key));
    base.forEach((b) => {
      if (!present.has(b.key)) merged.push(b);
    });
    return merged;
  } catch {
    return buildDefault();
  }
};

export function useEnquiryColumns() {
  const [columns, setColumns] = useState(load);

  useEffect(() => {
    localStorage.setItem(ENQUIRY_COLUMN_STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  const rename = useCallback(
    (key, label) => setColumns((c) => c.map((x) => (x.key === key ? { ...x, label } : x))),
    [],
  );

  const toggle = useCallback(
    (key) =>
      setColumns((c) =>
        c.map((x) => (x.key === key && x.hideable ? { ...x, visible: !x.visible } : x)),
      ),
    [],
  );

  const addColumn = useCallback((label) => {
    const name = (label || '').trim();
    if (!name) return;
    const col = {
      key: `custom_${Date.now()}`,
      label: name,
      visible: true,
      custom: true,
      sortable: false,
      hideable: true,
    };
    setColumns((c) => {
      const i = c.findIndex((x) => x.key === 'actions');
      return i === -1 ? [...c, col] : [...c.slice(0, i), col, ...c.slice(i)];
    });
  }, []);

  const reset = useCallback(() => setColumns(buildDefault()), []);

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);

  return { columns, visibleColumns, rename, toggle, addColumn, reset };
}
