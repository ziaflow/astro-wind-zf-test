import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const empty = () => ({
  version: 1,
  stopped: true,
  stopReason: 'Initial setup: automation disabled',
  generation: 0,
  gates: [false, false, false, false],
  inquiries: {},
  jobs: {},
  approvals: {},
  attempts: {},
  audit: [],
});
const id = (value) => {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,159}$/.test(value))
    throw Error('Invalid identifier');
  return value;
};
const note = (state, event, details = {}) => state.audit.push({ at: new Date().toISOString(), event, ...details });

// Local, single-machine pilot store. OS account/file permissions are the trust boundary.
// This module never loads .env, calls providers, or grants an approval automatically.
export class OperationsStore {
  constructor(path) {
    this.path = resolve(path);
    mkdirSync(dirname(this.path), { recursive: true });
    this.db = new DatabaseSync(this.path);
    this.db.exec(
      'PRAGMA busy_timeout=3000; PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL)'
    );
    this.db.prepare('INSERT OR IGNORE INTO state VALUES (1, ?)').run(JSON.stringify(empty()));
  }
  close() {
    this.db.close();
  }
  read() {
    return JSON.parse(this.db.prepare('SELECT body FROM state WHERE id=1').get().body);
  }
  change(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const state = this.read();
      const result = fn(state);
      this.db.prepare('UPDATE state SET body=? WHERE id=1').run(JSON.stringify(state));
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
  ingest(input) {
    const clientId = id(input.clientId),
      submissionId = id(input.submissionId);
    if (!input.receivedAt || !Number.isFinite(Date.parse(input.receivedAt))) throw Error('receivedAt required');
    // Deliberately excludes contact details and arbitrary payloads from pilot state.
    const inquiry = { clientId, submissionId, receivedAt: input.receivedAt, sourceRef: id(input.sourceRef) };
    const key = `${clientId}/${submissionId}`;
    return this.change((state) => {
      if (state.inquiries[key]) {
        if (digest(state.inquiries[key]) !== digest(inquiry)) throw Error('Conflicting submission replay');
        return { duplicate: true, jobId: state.jobs[key].id };
      }
      state.inquiries[key] = inquiry;
      state.jobs[key] = { id: key, clientId, sourceRef: inquiry.sourceRef, status: 'todo', owner: null };
      note(state, 'inquiry-recorded', { key });
      return { duplicate: false, jobId: key };
    });
  }
  claim(jobId, owner) {
    id(owner);
    return this.change((state) => {
      if (state.stopped) throw Error('Emergency stop is active');
      const job = state.jobs[jobId];
      if (!job || job.status !== 'todo' || job.owner) throw Error('Job unavailable or already owned');
      job.owner = owner;
      job.status = 'in-progress';
      job.token = randomUUID();
      note(state, 'job-claimed', { jobId, owner });
      return { ...job };
    });
  }
  release(jobId, token, evidence) {
    return this.change((state) => {
      const job = state.jobs[jobId];
      if (!job || !token || job.token !== token || job.status !== 'in-progress') throw Error('Ownership mismatch');
      if (typeof evidence !== 'string' || !evidence.trim()) throw Error('Handoff evidence required');
      job.status = 'in-review';
      job.evidence = evidence;
      delete job.token;
      note(state, 'job-ready-for-review', { jobId });
    });
  }
  stop(reason) {
    if (!reason?.trim()) throw Error('Stop reason required');
    return this.change((state) => {
      state.stopped = true;
      state.stopReason = reason;
      state.generation++;
      note(state, 'stopped', { reason });
    });
  }
  // Only the human-only CLI review flow calls these in normal operation.
  gate(number, evidence) {
    if (![1, 2, 3, 4].includes(number) || !evidence?.trim()) throw Error('Gate and evidence required');
    this.change((state) => {
      if (state.gates.slice(0, number - 1).some((passed) => !passed)) throw Error('Earlier gate has not passed');
      state.gates[number - 1] = true;
      note(state, 'gate-accepted', { number, evidence, reviewer: 'Jeremy' });
    });
  }
  resume(reconciliation) {
    if (!reconciliation?.trim()) throw Error('Reconciliation evidence required');
    this.change((state) => {
      if (!state.gates[0]) throw Error('Foundation gate has not passed');
      if (Object.values(state.jobs).some((job) => job.status === 'in-progress'))
        throw Error('Active jobs must be reconciled');
      state.stopped = false;
      state.stopReason = null;
      note(state, 'resumed', { reconciliation, reviewer: 'Jeremy' });
    });
  }
  approve(action, expiresAt) {
    validateAction(action);
    const expiry = Date.parse(expiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now() || expiry > Date.now() + 86400000)
      throw Error('Approval must expire within 24 hours');
    return this.change((state) => {
      if (state.stopped || !state.gates[1]) throw Error('Stopped or supervised-delivery gate incomplete');
      if (action.kind === 'client-update' && !state.gates[2]) throw Error('Reporting gate incomplete');
      const approvalId = randomUUID();
      state.approvals[approvalId] = {
        digest: digest(action),
        generation: state.generation,
        expiresAt,
        reviewer: 'Jeremy',
      };
      note(state, 'action-approved', { approvalId, digest: digest(action) });
      return approvalId;
    });
  }
  async execute(action, approvalId, adapter) {
    validateAction(action);
    if (typeof adapter !== 'function') throw Error('No provider adapter installed; external execution disabled');
    const attemptKey = `${action.clientId}/${action.id}`;
    this.change((state) => {
      const approval = state.approvals[approvalId];
      if (state.stopped || !state.gates[1] || (action.kind === 'client-update' && !state.gates[2]))
        throw Error('Execution gate closed');
      if (
        !approval ||
        approval.digest !== digest(action) ||
        approval.generation !== state.generation ||
        Date.parse(approval.expiresAt) <= Date.now()
      )
        throw Error('Missing, expired, or invalidated approval');
      if (state.attempts[attemptKey])
        throw Error('Action already attempted; reconcile provider result before any new action');
      // Reserve before calling the provider: ambiguous failures never auto-retry.
      state.attempts[attemptKey] = {
        approvalId,
        digest: digest(action),
        status: 'pending',
        at: new Date().toISOString(),
      };
      delete state.approvals[approvalId];
      note(state, 'execution-reserved', { attemptKey });
    });
    try {
      const result = await adapter(structuredClone(action), { idempotencyKey: attemptKey });
      if (!result?.providerId) throw Error('Provider acceptance unconfirmed');
      this.change((state) => {
        state.attempts[attemptKey].status = 'accepted';
        state.attempts[attemptKey].providerId = String(result.providerId);
        note(state, 'provider-accepted', { attemptKey });
      });
      return { status: 'accepted', providerId: String(result.providerId) };
    } catch (error) {
      this.change((state) => {
        state.attempts[attemptKey].status = 'unknown';
        note(state, 'provider-result-unknown', { attemptKey });
      });
      throw error;
    }
  }
  backup(path) {
    const state = this.read();
    const envelope = { format: 'ziaflow-operations-v1', checksum: digest(state), state };
    writeFileSync(path, JSON.stringify(envelope, null, 2), { flag: 'wx', mode: 0o600 });
    return { checksum: envelope.checksum, inquiries: Object.keys(state.inquiries).length };
  }
  restore(path) {
    const backup = JSON.parse(readFileSync(path, 'utf8'));
    if (
      backup.format !== 'ziaflow-operations-v1' ||
      backup.checksum !== digest(backup.state) ||
      backup.state?.version !== 1
    )
      throw Error('Invalid backup or checksum');
    const state = backup.state;
    if (
      !Array.isArray(state.gates) ||
      state.gates.length !== 4 ||
      !Array.isArray(state.audit) ||
      !state.jobs ||
      !state.inquiries ||
      !state.attempts
    )
      throw Error('Invalid backup state');
    this.change((current) => {
      if (current.audit.length || Object.keys(current.jobs).length || current.gates.some(Boolean))
        throw Error('Restore only into an empty, isolated store');
      Object.assign(current, state, {
        stopped: true,
        stopReason: 'Restored: reconciliation and human restart required',
        approvals: {},
        generation: state.generation + 1,
      });
      note(current, 'backup-restored');
    });
    return { restored: Object.keys(state.inquiries).length, stopped: true };
  }
}

function validateAction(action) {
  id(action.id);
  id(action.clientId);
  if (!['client-update', 'release', 'publish'].includes(action.kind)) throw Error('Unsupported action kind');
  for (const field of ['target', 'scope', 'artifactVersion', 'content']) {
    if (typeof action[field] !== 'string' || !action[field].trim()) throw Error(`Action ${field} required`);
  }
}
