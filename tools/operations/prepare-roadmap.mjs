import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Portable issue handoff, not a claim that issues were created in Linear.
const projects = [
  {
    name: 'Reliable operating foundation',
    forecast: 'Weeks 1–2',
    blockedBy: 'None',
    issues: [
      [
        'Verify source ownership and intake paths',
        'Map every live form to durable storage and one canonical lead identity. Record provider/event names and owner; retain raw contact details in the source system.',
        'A supervised synthetic live inquiry is traceable to one durable record; browser events are not proof of storage.',
      ],
      [
        'Prove duplicate and failure handling through Linear',
        'Use a stable submission identifier from intake to follow-up. Verify persistence before notifications; prevent duplicate tasks on replay and recover provider failures without losing the inquiry.',
        'One durable inquiry creates exactly one Linear follow-up. Replays and simulated provider failure are demonstrated with evidence.',
      ],
      [
        'Verify costs and partner entitlements',
        'Inventory all existing subscriptions, actual out-of-pocket costs, credits, usage and expiry dates. Preserve subscriptions and obtain vendor evidence.',
        'No unknown item is recorded as zero. Total cost and upcoming partner expirations documented; any conflict with the below-$100 cap is surfaced before new spending.',
      ],
      [
        'Prepare the first manual internal brief',
        'Use real approved sources and the internal Docs template. Record freshness, priorities, approvals, existing sales follow-ups and exceptions.',
        'Jeremy reviews a source-linked internal brief. Missing sources remain explicit; no client or public copy is shared.',
      ],
      [
        'Exercise emergency stop and isolated recovery',
        'Test the local controls, inventory remote schedules and stop active dispatchers. Export vendor data/config separately and restore only into isolation.',
        'Evidence shows no new automated execution after stop, queue reconciliation, verified backup restore and a human-only restart path.',
      ],
      [
        'Select one existing opportunity for a scoped offer',
        'Record actual opportunity, client permission, deliverable, exclusions, baseline, effort budget and acceptance. Continue human-led discovery/proposals.',
        'Jeremy chooses one real opportunity and approves measurable scope; no fabricated client or expanded service catalog.',
      ],
      [
        'Accept foundation gate or create remediation',
        'Collect intake, ownership, costs, manual brief, stop and recovery evidence. Forecast dates do not override failed checks.',
        'Jeremy explicitly accepts gate 1 only after all evidence is present; otherwise create remediation in this project.',
      ],
    ],
  },
  {
    name: 'Supervised AI delivery',
    forecast: 'Weeks 3–4',
    blockedBy: 'Reliable operating foundation',
    issues: [
      [
        'Bind ownership and exact-action approvals',
        'Assign one executing agent per issue; bind approval to content/version, target/recipient and scope. Invalidate edits, expiry and pre-stop approvals.',
        'Ownership conflict, edited content, changed target, expired approval and emergency-stop tests fail closed.',
      ],
      [
        'Complete one supervised delivery loop',
        'Use Orca on one approved issue. Record source commit, requirements, implementation, relevant checks, preview, exact human release approval and verified production behavior. Specialists optional.',
        'One actual change completes the full loop with evidence; no deployment based only on agent completion.',
      ],
      [
        'Accept delivery gate or record remediation',
        'Jeremy reviews the actual loop and ownership/approval evidence.',
        'Gate 2 accepted by Jeremy, or remediation remains in this project.',
      ],
    ],
  },
  {
    name: 'Reconciled reporting',
    forecast: 'Weeks 5–6',
    blockedBy: 'Reliable operating foundation; Supervised AI delivery',
    issues: [
      [
        'Build separate private internal and client hubs',
        'Use the existing Superhuman master plan and client template without deleting historical content. Create separate documents and authorized folders; link Drive files.',
        'Internal notes, other clients and private communications are inaccessible to client viewers. Hidden pages are not used for security.',
      ],
      [
        'Reconcile one real report and its exports',
        'Use one curated client/period snapshot for internal summary, client-safe summary, document, email draft and CSV. Name sources, timestamps and limitations.',
        'Totals agree; missing data is not zero; booking/call clicks are distinct from confirmed appointments/calls. Client separation tests and manual source checks pass.',
      ],
      [
        'Send one exact approved update via Customer.io',
        'Queue a draft, obtain Jeremy approval of exact content/recipient, recheck consent/suppression/reply status, send once and record provider IDs and delivery evidence.',
        'One reviewed client-safe update sends once. Acceptance and delivery are distinguished. Unknown outcomes are reconciled before retry.',
      ],
      [
        'Accept reporting gate; assess ClickUp need',
        'Review reconciliation, access separation and delivery evidence. Defer a ClickUp mirror unless the pilot client needs it.',
        'Jeremy accepts gate 3 or creates remediation; ClickUp decision is documented without duplicate editable backlogs.',
      ],
    ],
  },
  {
    name: 'Scoped offer pilot',
    forecast: 'Weeks 7–12',
    blockedBy: 'Reconciled reporting',
    issues: [
      [
        'Deliver the one approved pilot offer',
        'Execute the selected scope and agreed client permissions. Track owner/admin/delivery/review hours, actual costs, rework and exceptions.',
        'Agreed deliverable and client acceptance criteria met, with measured effort rather than assumed savings.',
      ],
      [
        'Document exceptions and repeat-revise-stop decision',
        'Compare actual effort and outcomes to baseline; record exceptions and recovery. Jeremy decides whether to repeat, revise or discontinue before expansion.',
        'Explicit human decision and lessons recorded; gate 4 accepted only with supporting pilot evidence.',
      ],
      [
        'Document portal requirements from pilot evidence',
        'Capture authenticated client analytics, status, files, communications and invoice links, plus separately authorized internal notes. Content improvements remain capacity dependent.',
        'Requirements reflect actual client demand, access separation and budget. No premature portal build or mandatory weekly article/page commitments.',
      ],
    ],
  },
];
const root = resolve('.ziaflow-ops/handoff');
mkdirSync(root, { recursive: true });
const cell = (value) => `"${String(value).replaceAll('"', '""')}"`;
const rows = [['Title', 'Description', 'Status', 'Project', 'Labels']];
for (const project of projects)
  for (const [title, scope, acceptance] of project.issues) {
    rows.push([
      title,
      `Outcome: ${title}\nScope: ${scope}\nAccountable human: Jeremy\nExecuting agent: Unassigned; single owner only\nPermitted data: Minimum approved client-scoped references; no secrets\nBlocked by: ${project.blockedBy}\nAcceptance: ${acceptance}\nEvidence: Pending\nNext action: Jeremy triage\nForecast: ${project.forecast}; gate is authoritative`,
      'Backlog',
      project.name,
      'operations',
    ]);
  }
writeFileSync(resolve(root, 'linear-issues.csv'), rows.map((row) => row.map(cell).join(',')).join('\r\n'));
writeFileSync(resolve(root, 'roadmap.json'), JSON.stringify(projects, null, 2));
for (const name of [
  'README',
  'internal-hub',
  'client-hub',
  'emergency-and-recovery',
  'agent-briefs',
  'master-plan-revision',
]) {
  writeFileSync(resolve(root, `${name}.md`), readFileSync(resolve('docs/operations', `${name}.md`), 'utf8'));
}
console.log(JSON.stringify({ directory: root, projects: projects.length, issues: rows.length - 1, imported: false }));
