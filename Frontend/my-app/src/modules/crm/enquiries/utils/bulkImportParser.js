// Maps common header names (from Meta / Housing / Facebook / CSV exports) to our fields.
const HEADER_MAP = {
  name: 'name',
  'full name': 'name',
  fullname: 'name',
  'client name': 'name',
  clientname: 'name',
  'lead name': 'name',
  phone: 'phone',
  'phone number': 'phone',
  phonenumber: 'phone',
  mobile: 'phone',
  'mobile number': 'phone',
  number: 'phone',
  contact: 'phone',
  'contact number': 'phone',
  email: 'email',
  'email address': 'email',
  'e-mail': 'email',
  company: 'companyName',
  'company name': 'companyName',
  city: 'city',
  location: 'city',
  remarks: 'remarks',
  remark: 'remarks',
  notes: 'remarks',
  note: 'remarks',
};

const splitCells = (line, delim) =>
  line.split(delim).map((c) => c.trim().replace(/^"(.*)"$/, '$1').trim());

// Parses pasted text or CSV content into row objects: { name, phone, email, companyName, city, remarks }.
// Supports: header row (mapped by name) OR positional (name, phone, email, company, city) OR single phone column.
export function parseLeadsText(text) {
  if (!text || !text.trim()) return [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const delim = lines[0].includes('\t') ? '\t' : ',';

  const firstCells = splitCells(lines[0], delim).map((c) => c.toLowerCase());
  const isHeader = firstCells.some((c) => HEADER_MAP[c]);

  let headers = null;
  let startIdx = 0;
  if (isHeader) {
    headers = firstCells.map((c) => HEADER_MAP[c] || null);
    startIdx = 1;
  }

  const rows = [];
  for (let i = startIdx; i < lines.length; i += 1) {
    const cells = splitCells(lines[i], delim);
    if (!cells.length || cells.every((c) => !c)) continue;

    let row;
    if (headers) {
      row = {};
      headers.forEach((key, idx) => {
        if (key) row[key] = cells[idx] || '';
      });
    } else if (cells.length === 1) {
      row = { phone: cells[0] };
    } else {
      row = {
        name: cells[0] || '',
        phone: cells[1] || '',
        email: cells[2] || '',
        companyName: cells[3] || '',
        city: cells[4] || '',
      };
    }
    rows.push(row);
  }
  return rows;
}
