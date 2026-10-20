import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assessDelivery, snapshotWorkspace, validateBrief } from '../tools/operations/delivery.mjs';

const brief = {
  issueRef: 'local:test-only',
  owner: 'codex',
  outcome: 'Test supervised delivery',
  scope: 'Local quality checks',
  preview: 'Pending manual preview',
  acceptanceCriteria: ['Regression checks pass'],
  limitations: ['No live verification'],
};

test('brief requires scope, ownership, acceptance and explicit limitations; commands are not accepted', () => {
  for (const field of Object.keys(brief)) {
    const invalid = { ...brief };
    delete invalid[field];
    assert.throws(() => validateBrief(invalid), /Brief/);
  }
  assert.throws(() => validateBrief({ ...brief, limitations: [] }), /limitations/);
  assert.deepEqual(validateBrief({ ...brief, command: 'deploy', releaseAuthorized: true }), brief);
});

test('passing checks request review; failures, missing checks and workspace drift block handoff', () => {
  const snapshot = { sha256: 'before' };
  const good = [{ exitCode: 0 }];
  const result = assessDelivery(snapshot, snapshot, good);
  assert.equal(result.status, 'in-review');
  assert.equal(result.humanAcceptance, 'pending');
  assert.equal(result.releaseAuthorized, false);
  assert.equal(result.productionVerified, false);
  assert.equal(assessDelivery(snapshot, { sha256: 'after' }, good).status, 'blocked');
  assert.equal(assessDelivery(snapshot, snapshot, [{ exitCode: 1 }]).status, 'blocked');
  assert.equal(assessDelivery(snapshot, snapshot, []).status, 'blocked');
});

test('snapshot detects tracked, staged, untracked and deleted bytes while excluding credentials and private state', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'ziaflow-delivery-'));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { stdio: 'pipe' });
  git('init');
  writeFileSync(join(root, 'source.txt'), 'original');
  git('add', 'source.txt');
  git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'fixture');
  const baseline = snapshotWorkspace(root);
  writeFileSync(join(root, 'source.txt'), 'edited');
  assert.notEqual(snapshotWorkspace(root).sha256, baseline.sha256);
  git('add', 'source.txt');
  const staged = snapshotWorkspace(root);
  writeFileSync(join(root, 'new.txt'), 'new work');
  assert.notEqual(snapshotWorkspace(root).sha256, staged.sha256);
  const untracked = snapshotWorkspace(root);
  writeFileSync(join(root, '.env.local'), 'SECRET=test');
  mkdirSync(join(root, '.ziaflow-ops'));
  writeFileSync(join(root, '.ziaflow-ops', 'private.json'), 'private');
  mkdirSync(join(root, 'outputs'));
  writeFileSync(join(root, 'outputs', 'review.txt'), 'reference artifact');
  assert.equal(snapshotWorkspace(root).sha256, untracked.sha256);
  rmSync(join(root, 'source.txt'));
  const deleted = snapshotWorkspace(root);
  assert.notEqual(deleted.sha256, untracked.sha256);
  assert.equal(deleted.files.find((f) => f.path === 'source.txt').kind, 'deleted');
  assert.ok(!JSON.stringify(deleted).includes('SECRET'));
});
