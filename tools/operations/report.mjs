const csvCell = (value) => {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
const day = (value) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const metricNames = [
  'website_sessions',
  'search_clicks',
  'website_submissions',
  'qualified_leads',
  'confirmed_bookings',
  'confirmed_calls',
  'marketing_spend',
];

// Input is a curated single-client snapshot, never a raw lead table or joined multi-client export.
export function buildReports(snapshot, clientId, now = new Date()) {
  if (!snapshot || snapshot.clientId !== clientId) throw Error('Client scope mismatch');
  if (!day(snapshot.periodStart) || !day(snapshot.periodEnd) || snapshot.periodStart > snapshot.periodEnd)
    throw Error('Invalid reporting period');
  if (!Array.isArray(snapshot.metrics)) throw Error('Metrics must be an array');
  const seen = new Set();
  const metrics = snapshot.metrics.map((row) => {
    if (!metricNames.includes(row.name) || seen.has(row.name)) throw Error('Unknown or duplicate metric');
    seen.add(row.name);
    if (row.clientId !== clientId || row.periodStart !== snapshot.periodStart || row.periodEnd !== snapshot.periodEnd)
      throw Error('Metric scope or period mismatch');
    const connected = row.connected === true;
    if (
      connected &&
      (!Number.isFinite(row.value) ||
        row.value < 0 ||
        !row.source ||
        !Number.isFinite(Date.parse(row.asOf)) ||
        Date.parse(row.asOf) > now.getTime())
    )
      throw Error('Connected metric requires valid value, source, and timestamp');
    return {
      name: row.name,
      value: connected ? row.value : null,
      source: connected ? String(row.source) : 'not connected',
      asOf: connected ? row.asOf : null,
      status: !connected ? 'not connected' : now.getTime() - Date.parse(row.asOf) > 172800000 ? 'stale' : 'available',
    };
  });
  for (const name of metricNames)
    if (!seen.has(name))
      metrics.push({ name, value: null, source: 'not connected', asOf: null, status: 'not connected' });
  const facts = (snapshot.clientFacts ?? [])
    .filter((fact) => fact.approved === true && fact.clientId === clientId)
    .map((fact) => ({ text: String(fact.text) }));
  const shared = {
    clientId,
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    generatedAt: now.toISOString(),
    metrics,
    facts,
    status: 'draft: human review required',
  };
  const client = { ...shared };
  const internal = {
    ...shared,
    internalNotes: String(snapshot.internalNotes ?? ''),
    effort: snapshot.effort ?? null,
    exceptions: snapshot.exceptions ?? [],
    costVerification: 'pending account evidence',
  };
  return { internal, client };
}

export function renderReport(report) {
  const heading = `ZiaFlow report: ${report.clientId} | ${report.periodStart} to ${report.periodEnd}`;
  const summary =
    report.facts.map((fact) => fact.text).join('\n') || 'No verified completion or outcome statements supplied.';
  const rows = report.metrics.map((row) => [
    row.name,
    row.value ?? 'not connected',
    row.status,
    row.source,
    row.asOf ?? 'not connected',
  ]);
  const csv =
    [['metric', 'value', 'status', 'source', 'as_of'], ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') +
    '\r\n';
  const body = `${heading}\n\n${report.status}\n\nSummary\n${summary}\n\n${rows.map((row) => row.join(' | ')).join('\n')}\n\nUnavailable data is not zero. Bookings and calls require confirmed source records; clicks are separate.\n`;
  const privateSection =
    'internalNotes' in report
      ? `\nInternal only\n${report.internalNotes}\n\nEffort\n${JSON.stringify(report.effort)}\n\nExceptions\n${JSON.stringify(report.exceptions)}\n`
      : '';
  return { markdown: body + privateSection, email: `Subject: ${heading}\n\n${body}${privateSection}`, csv };
}
