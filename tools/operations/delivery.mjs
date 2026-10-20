import { createHash, randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { lstatSync, mkdirSync, readFileSync, readlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const git = (root, args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });

// Fingerprint file bytes, including uncommitted/untracked work. Never include contents
// in the handoff. Ignore private runtime state and credential files even if tracked.
export function snapshotWorkspace(root) {
  const head = git(root, ['rev-parse', 'HEAD']).trim();
  const paths = [...new Set(git(root, ['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0'))]
    .filter(Boolean)
    .filter((path) => !path.startsWith('outputs/'))
    .filter((path) => !/(^|\/)(\.env[^/]*|\.ziaflow-ops|\.git|\.aws|node_modules)(\/|$)/i.test(path))
    .sort();
  const files = paths.map((path) => {
    const absolute = resolve(root, path);
    try {
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) return { path, kind: 'symlink', sha256: hash(readlinkSync(absolute)) };
      if (!stat.isFile()) throw Error(`Unsupported workspace entry: ${path}`);
      return { path, kind: 'file', sha256: hash(readFileSync(absolute)) };
    } catch (error) {
      if (error.code === 'ENOENT') return { path, kind: 'deleted' };
      throw error;
    }
  });
  return {
    head,
    sha256: hash(JSON.stringify({ head, files })),
    files,
    exclusions: ['outputs/', '.env*', '.ziaflow-ops/', '.git/', '.aws/', 'node_modules/', 'Git-ignored files'],
  };
}

export function validateBrief(input) {
  const brief = {};
  for (const field of ['issueRef', 'owner', 'outcome', 'scope', 'preview']) {
    if (typeof input?.[field] !== 'string' || !input[field].trim()) throw Error(`Brief ${field} required`);
    brief[field] = input[field].trim();
  }
  for (const field of ['acceptanceCriteria', 'limitations']) {
    if (
      !Array.isArray(input[field]) ||
      !input[field].length ||
      input[field].some((s) => typeof s !== 'string' || !s.trim())
    )
      throw Error(`Brief ${field} must contain nonempty evidence/review notes`);
    brief[field] = input[field].map((s) => s.trim());
  }
  // Whitelist fields: an input cannot inject commands, approve itself, or select a release target.
  return brief;
}

export function assessDelivery(before, after, checks) {
  const stable = before.sha256 === after.sha256;
  const passed = checks.length > 0 && checks.every((check) => check.exitCode === 0);
  return {
    status: stable && passed ? 'in-review' : 'blocked',
    workspaceUnchangedDuringChecks: stable,
    checksPassed: passed,
    humanAcceptance: 'pending',
    releaseAuthorized: false,
    productionVerified: false,
  };
}

// Fixed, local checks only. Do not use npm run build: its postbuild submits IndexNow.
const checks = [
  [
    'unit',
    [
      '--test',
      'tests/operations.test.mjs',
      'tests/contact-endpoint.test.mjs',
      'tests/audit-endpoint.test.mjs',
      'tests/delivery.test.mjs',
    ],
  ],
  ['astro', ['node_modules/astro/astro.js', 'check']],
];

export function runDelivery(root, input) {
  const brief = validateBrief(input);
  const before = snapshotWorkspace(root);
  const results = checks.map(([name, args]) => {
    const startedAt = new Date().toISOString();
    const result = spawnSync(process.execPath, args, {
      cwd: root,
      encoding: 'utf8',
      timeout: 300000,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    });
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    return {
      name,
      command: ['node', ...args],
      startedAt,
      finishedAt: new Date().toISOString(),
      exitCode: result.status ?? 1,
      error: result.error?.code || null,
      // Keep potentially sensitive command output out of the portable handoff.
      outputSha256: hash((result.stdout || '') + (result.stderr || '')),
    };
  });
  const after = snapshotWorkspace(root);
  const report = {
    format: 'ziaflow-delivery-v1',
    createdAt: new Date().toISOString(),
    brief,
    briefSha256: hash(JSON.stringify(brief)),
    workspace: before,
    finalWorkspaceSha256: after.sha256,
    checks: results,
    ...assessDelivery(before, after, results),
  };
  const directory = resolve(root, '.ziaflow-ops', 'deliveries', randomUUID());
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, 'handoff.json'), JSON.stringify(report, null, 2) + '\n', {
    flag: 'wx',
    mode: 0o600,
  });
  return { report, directory };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw Error('Usage: npm run delivery:check -- path/to/brief.json');
    const input = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
    const { report, directory } = runDelivery(process.cwd(), input);
    console.log(JSON.stringify({ status: report.status, directory, releaseAuthorized: false }));
    if (report.status === 'blocked') process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
