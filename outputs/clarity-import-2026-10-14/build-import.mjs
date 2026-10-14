import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const sourceDir = 'C:/Users/jerem/Downloads/ziaflow.com-Performance-on-Search-2026-09-29';
const outputDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1'));
const files = [
  ['Clarity_ZiaFlow_Dashboard_10-14-2026 10 35 AM.csv', 'dashboard_2026_10_14', '2026-10-14 10:35:00'],
  ['Clarity_ZiaFlow_Dashboard_09-29-2026 05 24 PM.csv', 'dashboard_2026_09_29', '2026-09-29 17:24:00'],
];

function parseCSV(text) {
  const rows = [];
  let fields = [], field = '', quoted = false, line = 1, startLine = 1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else { quoted = !quoted; }
    } else if (c === ',' && !quoted) { fields.push(field); field = ''; }
    else if ((c === '\r' || c === '\n') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      fields.push(field);
      if (fields.some(f => f !== '')) rows.push({ line: startLine, fields });
      fields = []; field = ''; line++; startLine = line;
    } else { field += c; if (c === '\n') line++; }
  }
  assert.equal(quoted, false, 'Unterminated CSV quote');
  if (field || fields.length) { fields.push(field); rows.push({ line: startLine, fields }); }
  return rows;
}
const quote = value => value === null ? 'NULL' : "'" + String(value).replaceAll("'", "''") + "'";
const num = value => value && /^-?\d+(?:\.\d+)?$/.test(value) ? value : null;
const dateTime = text => {
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{1,2}):(\d{2}) (AM|PM)$/);
  assert.ok(match, `Invalid source date: ${text}`);
  const [, month, day, year, hour, minute, meridiem] = match;
  const h = Number(hour) % 12 + (meridiem === 'PM' ? 12 : 0);
  return `${year}-${month}-${day} ${String(h).padStart(2, '0')}:${minute}:00`;
};

const summary = [];
let sql = '-- Microsoft Clarity CSV import. Source timestamps have no supplied timezone.\nBEGIN;\nCREATE SCHEMA IF NOT EXISTS clarity;\n';
for (const [fileName, tableName, exportedAt] of files) {
  const bytes = fs.readFileSync(path.join(sourceDir, fileName));
  const rows = parseCSV(bytes.toString('utf8').replace(/^\uFEFF/, ''));
  const project = rows.find(r => r.fields[0] === 'Project name').fields[1];
  const period = rows.find(r => r.fields[0] === 'Date range').fields[1].split(' - ').map(dateTime);
  const sha = crypto.createHash('sha256').update(bytes).digest('hex');
  let metric = null, headers = [], dataRows = 0;
  const values = rows.map(row => {
    const f = row.fields;
    let kind = 'data', label, value = null;
    if (f[0] === 'Project name' || f[0] === 'Date range') {
      kind = 'metadata'; label = f[0]; value = f[1];
    } else if (f[0] === 'Metric') {
      kind = 'section'; metric = f[1]; headers = f.slice(1); label = metric;
    } else if ((metric === 'All users' && f[1] === 'User id') ||
               (metric === 'URL performance' && f[1] === 'URL') ||
               (metric === 'JavaScript errors' && f[1] === '' && f[2] === 'No. of sessions')) {
      kind = 'header'; headers = f.slice(1); label = f[1] || null;
    } else {
      dataRows++;
      label = f[0] || f[1] || null;
      value = f[0] ? (f[1] ?? null) : (f[2] ?? null);
    }
    const numericMatch = kind === 'data' && value !== null ? value.match(/^(-?\d+(?:\.\d+)?)(ms|s|%)?$/) : null;
    const percentage = kind === 'data' && /^\d+(?:\.\d+)?%$/.test(f[3] ?? '') ? f[3].slice(0, -1) : null;
    const sessions = kind === 'data' && ['Insights','Browsers','Devices','Top pages','Smart events','Referrer','All users'].includes(metric) ? num(value) : null;
    const details = kind === 'data' && metric === 'All users' ? { user_id: f[1], country: f[3], device: f[4] }
      : kind === 'data' && metric === 'URL performance' ? { url: f[1], score: f[2], lcp: f[3], inp: f[4], cls: f[5] } : {};
    return '(' + [row.line, quote(kind), quote(metric), quote(label), quote(value), numericMatch?.[1] ?? 'NULL', quote(numericMatch?.[2] ?? null), sessions ?? 'NULL', percentage ?? 'NULL', quote(JSON.stringify(details)) + '::jsonb', quote(JSON.stringify(headers)) + '::jsonb', quote(JSON.stringify(f)) + '::jsonb'].join(', ') + ')';
  });
  const sessionsRow = rows.find(r => r.fields[1] === 'Total sessions');
  assert.equal(sessionsRow.fields[2], tableName.endsWith('10_14') ? '426' : '414');
  assert.equal(new Set(rows.map(r => r.line)).size, rows.length);
  sql += `\nCREATE TABLE clarity.${tableName} (
  source_row integer PRIMARY KEY CHECK (source_row > 0),
  row_kind text NOT NULL CHECK (row_kind IN ('metadata','section','header','data')),
  metric text,
  label text,
  value_text text,
  value_numeric numeric,
  value_unit text,
  sessions bigint,
  percentage numeric,
  details jsonb NOT NULL,
  source_headers jsonb NOT NULL,
  raw_fields jsonb NOT NULL CHECK (jsonb_typeof(raw_fields) = 'array'),
  project_name text NOT NULL DEFAULT ${quote(project)},
  source_file text NOT NULL DEFAULT ${quote(fileName)},
  source_sha256 text NOT NULL DEFAULT ${quote(sha)},
  period_start timestamp without time zone NOT NULL DEFAULT ${quote(period[0])},
  period_end timestamp without time zone NOT NULL DEFAULT ${quote(period[1])},
  exported_at timestamp without time zone NOT NULL DEFAULT ${quote(exportedAt)},
  imported_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE clarity.${tableName} IS ${quote('Complete nonblank source rows from ' + fileName + '. Filter row_kind = data for metric records. Overlapping reporting windows are snapshots, not daily metrics. Source timestamp timezone is unspecified.')};
ALTER TABLE clarity.${tableName} ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON clarity.${tableName} FROM PUBLIC, anon, authenticated;
GRANT ALL ON clarity.${tableName} TO service_role;
INSERT INTO clarity.${tableName} (source_row,row_kind,metric,label,value_text,value_numeric,value_unit,sessions,percentage,details,source_headers,raw_fields) VALUES
${values.join(',\n')};
DO $verify$ BEGIN
  IF (SELECT count(*) FROM clarity.${tableName}) <> ${rows.length} THEN RAISE EXCEPTION 'Source row count mismatch for ${tableName}'; END IF;
  IF (SELECT count(*) FROM clarity.${tableName} WHERE row_kind = 'data') <> ${dataRows} THEN RAISE EXCEPTION 'Data row count mismatch for ${tableName}'; END IF;
  IF (SELECT value_numeric FROM clarity.${tableName} WHERE metric = 'Sessions' AND label = 'Total sessions') <> ${sessionsRow.fields[2]} THEN RAISE EXCEPTION 'Session total mismatch for ${tableName}'; END IF;
END $verify$;
`;
  summary.push({ table: `clarity.${tableName}`, sourceFile: fileName, sourceRows: rows.length, dataRows, sourceSha256: sha, period, totalSessions: Number(sessionsRow.fields[2]) });
}
sql += '\nCOMMIT;\n';
sql += summary.map(s => `SELECT '${s.table}' AS table_name, count(*) AS source_rows, count(*) FILTER (WHERE row_kind = 'data') AS data_rows FROM ${s.table}`).join('\nUNION ALL\n') + ';\n';
fs.writeFileSync(path.join(outputDir, 'import-clarity.sql'), sql);
fs.writeFileSync(path.join(outputDir, 'import-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
