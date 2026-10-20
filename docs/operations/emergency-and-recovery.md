# Emergency stop and recovery

Jeremy is accountable for stop, reconciliation and restart. Do not disable ordinary human sales or the existing website's manual intake path.

## Stop

1. Run `npm run ops -- stop "incident reference and reason"`. It blocks new local claims/execution and invalidates old local approvals. Run `npm run ops -- status` and save the incident evidence privately.
2. Cloud controls are separate: set GitHub repository variable `ZIAFLOW_AUTOMATION_ENABLED` to `false` and cancel currently running scheduled ingestion jobs. The variable gates the revised workflow only after merge. Inspect all other repository/provider schedules and pause affected jobs individually.
3. In Hermes and Orca, stop the affected active agent sessions and scheduled dispatchers. This kit has not installed or modified those schedules. Identify sessions by issue and owner; do not terminate unrelated work.
4. In Customer.io pause affected automated workflows and inspect queued drafts/scheduled sends. Do not assume a local stop retracts a message already accepted by a provider. Keep necessary human-managed transactional service available.
5. Record pending/unknown provider attempts, active work, recipients/targets and timestamps in the private incident record. Reconcile against provider records; never resend on silence.

The local switch cannot cancel an already executing provider call, revoke remote credentials or stop unrelated cloud systems. During this pilot no live outbound adapter is installed.

## Back up and restore

```powershell
npm run ops -- backup .ziaflow-ops/backup-2026-10-18.json
$env:ZIAFLOW_OPS_DIR = '.ziaflow-ops/restore-check'
npm run ops -- restore .ziaflow-ops/backup-2026-10-18.json
npm run ops -- status
Remove-Item Env:ZIAFLOW_OPS_DIR
```

Use a new backup filename and an empty, isolated restore destination. Snapshots include local operational state and a SHA-256 checksum; they exclude `.env`, API keys and raw lead payloads because those are never ingested. They may include private business evidence and must remain private. The checksum detects corruption, not malicious alteration by someone with filesystem access.

Restores force stop and remove approvals. Compare inquiry IDs/counts, jobs and attempt history to the original. Never test restore over production. Back up vendor-owned operational data and workflow configuration separately using each vendor's supported exports; this local backup does **not** back up Supabase, Customer.io, Docs, Drive, Linear, invoices, or the website.

## Restart

Reconcile every in-progress job: the original owner uses its token to hand off with evidence, or Jeremy repairs the record in a separately reviewed maintenance change if the token/owner is lost. No automatic stale-lease takeover. Reconcile unknown provider outcomes manually; do not erase the reservation.

After source data, queues, approval versions, budget and provider health are reviewed, Jeremy uses interactive `resume "private reconciliation evidence reference"`. The foundation gate must already be accepted. Obtain new exact-action approvals. Re-enable only the reviewed remote schedules, run one supervised job, then verify source records and results before wider resumption.
