// Compatibility entry point: draft-only until verified source data and human approvals exist.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { buildReports, renderReport } from '../operations/report.mjs';

export async function generateAndSendWeeklyReport(snapshot, clientId) {
  if (!snapshot || !clientId)
    throw Error('A reconciled snapshot and explicit clientId are required. No messages were sent.');
  const reports = buildReports(snapshot, clientId);
  return {
    success: true,
    sent: false,
    status: 'draft-only',
    internal: renderReport(reports.internal),
    client: renderReport(reports.client),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [path, clientId] = process.argv.slice(2);
  if (!path || !clientId) {
    console.error(
      'Draft-only: npm run ops -- report <reconciled-snapshot.json> <client-id> [new-output-directory]. No messages sent.'
    );
    process.exitCode = 1;
  } else {
    try {
      const result = await generateAndSendWeeklyReport(JSON.parse(readFileSync(path, 'utf8')), clientId);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
