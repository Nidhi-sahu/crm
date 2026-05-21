const csvCell = (val) => {
  const s = String(val ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const sectionToRows = (title, rows) => {
  const out = [[title], ...rows, ['']];
  return out;
};

export const exportReportCSV = ({ rangeLabel, generatedAt, performance, funnel, time, value }) => {
  const lines = [];

  lines.push(...sectionToRows('LANGDI CRM — SALES REPORT', [
    ['Date Range', rangeLabel],
    ['Generated', generatedAt],
  ]));

  if (performance) {
    lines.push(...sectionToRows('OVERALL PERFORMANCE', [
      ['Total Enquiries', performance.totalEnquiries],
      ['Qualified Enquiries', performance.qualified],
      ['Converted Leads', performance.converted],
      ['Overall Conversion Rate', `${performance.conversionRate}%`],
    ]));
  }

  if (funnel?.length) {
    lines.push(['CONVERSION FUNNEL']);
    lines.push(['Stage', 'Count', 'Conversion %']);
    funnel.forEach((s) => lines.push([s.label, s.count, `${s.pctOfTop}%`]));
    lines.push(['']);
  }

  if (value) {
    lines.push(...sectionToRows('VALUE ANALYSIS', [
      ['Total Actual Value', value.totalValue],
      ['Average Sale Value', value.avgValue],
      ['Deals Closed', value.dealsClosed],
    ]));
  }

  if (time?.length) {
    lines.push(['TIME ANALYSIS (per stage)']);
    lines.push(['Stage', 'Avg Days', 'Fastest (hrs)', 'Slowest (hrs)', 'Completions']);
    time.forEach((t) =>
      lines.push([t.stageName, t.avgDays, t.minHours, t.maxHours, t.sampleCount]),
    );
    lines.push(['']);
  }

  const csv = lines.map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `langdi-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
