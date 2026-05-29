import { ENQUIRY_COLUMNS } from '../constants/enquiryColumns';

export function EnquiryTableSkeletonRows({ rows = 6, columns = ENQUIRY_COLUMNS }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={`sk-${i}`}>
      {columns.map((col) => (
        <td key={col.key} className="px-4 py-3">
          <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-slate-200/70" />
        </td>
      ))}
    </tr>
  ));
}
