import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { OperationsStore } from '../tools/operations/store.mjs';
import { buildReports, renderReport } from '../tools/operations/report.mjs';
import { generateAndSendWeeklyReport } from '../tools/agents/dispatch-weekly-report.mjs';

const inquiry = {
  clientId: 'ziaflow',
  submissionId: 'test-1',
  receivedAt: '2026-10-18T12:00:00Z',
  sourceRef: 'test-only',
};
const action = {
  id: 'update-1',
  clientId: 'ziaflow',
  kind: 'client-update',
  target: 'test@example.invalid',
  scope: 'weekly summary only',
  artifactVersion: 'v1',
  content: 'Verified test summary',
};
const expiry = () => new Date(Date.now() + 60000).toISOString();
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'ziaflow-operations-'));
  const store = new OperationsStore(join(root, 'state.sqlite'));
  t.after(() => {
    store.close();
    rmSync(root, { recursive: true, force: true });
  });
  return { root, store };
}
function ready(store) {
  store.gate(1, 'synthetic-test-evidence');
  store.gate(2, 'synthetic-test-evidence');
  store.gate(3, 'synthetic-test-evidence');
  store.resume('synthetic-test-only');
}
test('intake and task persist atomically; replay is deduplicated across connections', (t) => {
  const { store } = fixture(t);
  assert.equal(store.ingest(inquiry).duplicate, false);
  const second = new OperationsStore(store.path);
  try {
    assert.equal(second.ingest(inquiry).duplicate, true);
  } finally {
    second.close();
  }
  assert.equal(Object.keys(store.read().jobs).length, 1);
  assert.throws(() => store.ingest({ ...inquiry, sourceRef: 'conflict' }), /Conflicting/);
  assert.equal(Object.keys(store.read().inquiries).length, 1);
});
test('transaction failure leaves no partial lead or task', (t) => {
  const { store } = fixture(t);
  assert.throws(() =>
    store.change((state) => {
      state.inquiries.partial = inquiry;
      throw Error('disk/provider preparation failed');
    })
  );
  assert.equal(Object.keys(store.read().inquiries).length, 0);
  assert.equal(Object.keys(store.read().jobs).length, 0);
});
test('stop blocks dispatch and two agents cannot claim the same job', (t) => {
  const { store } = fixture(t);
  const { jobId } = store.ingest(inquiry);
  assert.throws(() => store.claim(jobId, 'orca'), /stop/i);
  ready(store);
  const lease = store.claim(jobId, 'orca');
  assert.throws(() => store.claim(jobId, 'hermes'), /owned/);
  assert.throws(() => store.release(jobId, 'wrong-token', 'evidence'), /Ownership/);
  store.stop('test-stop');
  assert.throws(() => store.resume('checked queue'), /Active jobs/);
  store.release(jobId, lease.token, 'work stopped; no external effect');
  store.resume('all active work handed off; queue checked');
});
test('approval binds target, content, scope, version, kind and client', async (t) => {
  const { store } = fixture(t);
  ready(store);
  const approval = store.approve(action, expiry());
  for (const field of ['target', 'content', 'scope', 'artifactVersion', 'clientId', 'id']) {
    await assert.rejects(
      store.execute({ ...action, [field]: 'changed' }, approval, async () => ({ providerId: 'must-not-send' })),
      /invalidated/
    );
  }
  assert.equal(Object.keys(store.read().attempts).length, 0);
});
test('stop invalidates old approvals even after resume', async (t) => {
  const { store } = fixture(t);
  ready(store);
  const approval = store.approve(action, expiry());
  store.stop('incident');
  store.resume('reconciled');
  await assert.rejects(
    store.execute(action, approval, async () => ({ providerId: 'must-not-send' })),
    /invalidated/
  );
});
test('gates cannot be skipped and expired approvals cannot execute', async (t) => {
  const { store } = fixture(t);
  assert.throws(() => store.gate(2, 'evidence'), /Earlier/);
  assert.throws(() => store.resume('evidence'), /Foundation/);
  ready(store);
  assert.throws(() => store.approve(action, '2020-01-01T00:00:00Z'), /expire/);
  const approval = store.approve(action, expiry());
  store.change((state) => {
    state.approvals[approval].expiresAt = '2020-01-01T00:00:00Z';
  });
  await assert.rejects(
    store.execute(action, approval, async () => ({ providerId: 'must-not-send' })),
    /expired/
  );
});
test('provider acceptance is recorded and duplicate sends cannot execute', async (t) => {
  const { store } = fixture(t);
  ready(store);
  let sends = 0;
  const adapter = async () => {
    sends++;
    return { providerId: 'fake-provider-1' };
  };
  const approval = store.approve(action, expiry());
  assert.equal((await store.execute(action, approval, adapter)).status, 'accepted');
  const next = store.approve(action, expiry());
  await assert.rejects(store.execute(action, next, adapter), /already attempted/);
  assert.equal(sends, 1);
});
test('ambiguous provider failure is retained and never automatically retried', async (t) => {
  const { store } = fixture(t);
  ready(store);
  const approval = store.approve(action, expiry());
  await assert.rejects(
    store.execute(action, approval, async () => {
      throw Error('timeout');
    }),
    /timeout/
  );
  assert.equal(store.read().attempts['ziaflow/update-1'].status, 'unknown');
  const next = store.approve(action, expiry());
  await assert.rejects(
    store.execute(action, next, async () => ({ providerId: 'duplicate' })),
    /already attempted/
  );
});
test('no live provider adapter is available by default', async (t) => {
  const { store } = fixture(t);
  ready(store);
  await assert.rejects(store.execute(action, store.approve(action, expiry())), /disabled/);
});
test('isolated backup restore preserves records, invalidates approvals and starts stopped', (t) => {
  const { store, root } = fixture(t);
  ready(store);
  store.ingest(inquiry);
  store.approve(action, expiry());
  const path = join(root, 'backup.json');
  store.backup(path);
  const restored = new OperationsStore(join(root, 'isolated', 'state.sqlite'));
  try {
    assert.equal(restored.restore(path).restored, 1);
    assert.deepEqual(restored.read().inquiries, store.read().inquiries);
    assert.deepEqual(restored.read().jobs, store.read().jobs);
    assert.equal(restored.read().stopped, true);
    assert.deepEqual(restored.read().approvals, {});
    assert.throws(() => restored.restore(path), /empty/);
  } finally {
    restored.close();
  }
  const corrupt = JSON.parse(readFileSync(path, 'utf8'));
  corrupt.state.stopped = !corrupt.state.stopped;
  writeFileSync(path, JSON.stringify(corrupt));
  assert.throws(() => store.restore(path), /checksum/);
});
const snapshot = {
  clientId: 'ziaflow',
  periodStart: '2026-10-12',
  periodEnd: '2026-10-18',
  internalNotes: 'PRIVATE-NOTE',
  exceptions: ['PRIVATE-EXCEPTION'],
  metrics: [
    {
      clientId: 'ziaflow',
      name: 'confirmed_bookings',
      value: 0,
      connected: true,
      source: 'verified-booking-records',
      asOf: '2026-10-18T12:00:00Z',
      periodStart: '2026-10-12',
      periodEnd: '2026-10-18',
    },
  ],
  clientFacts: [
    { clientId: 'ziaflow', approved: true, text: 'Approved completed work' },
    { clientId: 'other', approved: true, text: 'OTHER-CLIENT' },
    { clientId: 'ziaflow', approved: false, text: 'UNAPPROVED' },
  ],
};
test('internal and client reports reconcile without leaking notes, exceptions or other clients', () => {
  const reports = buildReports(snapshot, 'ziaflow', new Date('2026-10-18T14:00:00Z'));
  assert.deepEqual(reports.client.metrics, reports.internal.metrics);
  assert.equal(renderReport(reports.client).csv, renderReport(reports.internal).csv);
  const clientText = JSON.stringify(reports.client) + JSON.stringify(renderReport(reports.client));
  for (const marker of ['PRIVATE-NOTE', 'PRIVATE-EXCEPTION', 'OTHER-CLIENT', 'UNAPPROVED'])
    assert.ok(!clientText.includes(marker));
  assert.equal(reports.client.metrics.find((m) => m.name === 'confirmed_bookings').value, 0);
  assert.equal(reports.client.metrics.find((m) => m.name === 'confirmed_calls').value, null);
});
test('client/period mismatches and click metrics disguised as confirmed events are rejected', () => {
  assert.throws(() => buildReports(snapshot, 'another-client'));
  assert.throws(() =>
    buildReports({ ...snapshot, metrics: [{ ...snapshot.metrics[0], clientId: 'other' }] }, 'ziaflow')
  );
  assert.throws(() =>
    buildReports({ ...snapshot, metrics: [{ ...snapshot.metrics[0], periodStart: '2026-09-01' }] }, 'ziaflow')
  );
  assert.throws(() =>
    buildReports({ ...snapshot, metrics: [{ ...snapshot.metrics[0], name: 'booking_clicks' }] }, 'ziaflow')
  );
});
test('stale data is explicit; future timestamps and missing provider values are rejected', () => {
  const stale = buildReports(snapshot, 'ziaflow', new Date('2026-10-21T12:00:00Z'));
  assert.equal(stale.client.metrics[0].status, 'stale');
  assert.throws(() => buildReports(snapshot, 'ziaflow', new Date('2026-10-01T12:00:00Z')));
  assert.throws(() => buildReports({ ...snapshot, metrics: [{ ...snapshot.metrics[0], value: null }] }, 'ziaflow'));
});
test('CSV formulas are neutralized and weekly-report compatibility entry is draft-only', async () => {
  const malicious = {
    ...snapshot,
    metrics: [{ ...snapshot.metrics[0], source: '=HYPERLINK("https://example.invalid")' }],
  };
  const report = buildReports(malicious, 'ziaflow', new Date('2026-10-18T14:00:00Z'));
  assert.ok(renderReport(report.client).csv.includes("'=HYPERLINK"));
  await assert.rejects(generateAndSendWeeklyReport(), /required/);
  assert.equal((await generateAndSendWeeklyReport(snapshot, 'ziaflow')).sent, false);
});
