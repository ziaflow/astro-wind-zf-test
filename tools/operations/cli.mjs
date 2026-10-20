import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { OperationsStore } from './store.mjs';
import { buildReports, renderReport } from './report.mjs';

const [command = 'status', ...args] = process.argv.slice(2);
const root = resolve(process.env.ZIAFLOW_OPS_DIR || '.ziaflow-ops');
const load = (path) => JSON.parse(readFileSync(resolve(path), 'utf8'));
async function humanReview(summary) {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw Error('Human review requires an interactive terminal; agents must not approve');
  console.log(summary);
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    if ((await prompt.question('Jeremy: after reviewing the evidence, type APPROVE: ')) !== 'APPROVE')
      throw Error('Not approved');
  } finally {
    prompt.close();
  }
}
let store;
try {
  mkdirSync(root, { recursive: true });
  if (command === 'report') {
    if (!args[0] || !args[1]) throw Error('Usage: report snapshot.json client-id [new-output-directory]');
    const reports = buildReports(load(args[0]), args[1]);
    const destination = resolve(args[2] || `${root}/reports/${Date.now()}`);
    if (existsSync(destination)) throw Error('Report output directory must be new');
    mkdirSync(destination, { recursive: true });
    for (const audience of ['internal', 'client']) {
      const directory = resolve(destination, audience);
      mkdirSync(directory);
      writeFileSync(resolve(directory, 'snapshot.json'), JSON.stringify(reports[audience], null, 2), { mode: 0o600 });
      const rendered = renderReport(reports[audience]);
      for (const [file, content] of Object.entries({
        'report.md': rendered.markdown,
        'email-draft.txt': rendered.email,
        'metrics.csv': rendered.csv,
      }))
        writeFileSync(resolve(directory, file), content, { mode: 0o600 });
    }
    console.log(JSON.stringify({ status: 'draft-only', destination, sent: false }));
  } else {
    store = new OperationsStore(resolve(root, 'operations.sqlite'));
    let result;
    switch (command) {
      case 'init':
      case 'status': {
        const state = store.read();
        result = {
          stopped: state.stopped,
          reason: state.stopReason,
          gates: state.gates,
          inquiries: Object.keys(state.inquiries).length,
          jobs: Object.values(state.jobs).map(({ id, status, owner }) => ({ id, status, owner })),
          attempts: state.attempts,
          providerAdapter: 'not installed',
        };
        break;
      }
      case 'ingest':
        result = store.ingest(load(args[0]));
        break;
      case 'claim':
        result = store.claim(args[0], args[1]);
        break;
      case 'handoff':
        store.release(args[0], args[1], args[2]);
        result = { status: 'in-review' };
        break;
      case 'stop':
        store.stop(args[0]);
        result = { stopped: true };
        break;
      case 'gate':
        await humanReview(`Gate ${args[0]} acceptance evidence: ${args[1]}`);
        store.gate(Number(args[0]), args[1]);
        result = { gate: Number(args[0]), accepted: true };
        break;
      case 'resume':
        await humanReview(`Reconciliation evidence: ${args[0]}`);
        store.resume(args[0]);
        result = { stopped: false };
        break;
      case 'approve': {
        const action = load(args[0]);
        await humanReview(`Exact action:\n${JSON.stringify(action, null, 2)}\nExpires: ${args[1]}`);
        result = { approvalId: store.approve(action, args[1]) };
        break;
      }
      case 'backup':
        result = store.backup(resolve(args[0]));
        break;
      case 'restore':
        result = store.restore(resolve(args[0]));
        break;
      default:
        throw Error(
          'Commands: init, status, ingest, claim, handoff, stop, gate, resume, approve, backup, restore, report. No send command is installed.'
        );
    }
    console.log(JSON.stringify(result, null, 2));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  store?.close();
}
