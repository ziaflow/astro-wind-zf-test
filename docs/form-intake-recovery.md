# Website form intake and delivery recovery

All contact, audit, booking-audit and quick inquiry forms post to `/api/contact`.
The shared browser handler locks submission while a request is pending, keeps its
idempotency key after a failed response, and records `generate_lead` only after a
new receipt is returned. Analytics events contain receipt and form identifiers,
not email addresses or message content.

## Source and event contract

The restricted receipt stores the actual page path, form type and supplied UTM
parameters. These are attribution claims supplied by the browser, not verified
acquisition or conversion evidence. The contact API also accepts legacy field
names (`comments`, `company_name`, `page_submitted_from`, first/last name).

`CIO_CDP_WRITE_KEY` uses the existing Customer.io HTTP source **ZiaFlow website
server intake** (183140). It is already configured for Production and Preview in
Vercel. Never put this credential in a browser bundle. `CUSTOMER_IO_CDP_REGION`
defaults to `us`; use `eu` only for an EU workspace.

After saving an inquiry, the API submits a strict-mode Pipelines batch containing
an identify call and a `form_submit` event, with deterministic message IDs based
on the receipt. This matches the existing **Website Lead – Welcome & Sales
Pipeline** event trigger. The separate intake webhook remains responsible for
immediate confirmation and internal notification.

The nurture automation is still draft. Activation is a separate release step:
verify actual source ingestion and profile association, suppress its redundant
welcome/internal-alert steps if the intake webhook remains enabled, and test the
booking exit and reply/disqualification behavior before starting it. This change
does not activate it or certify a seven-day journey.

## Dispatch journal and retry policy

`lead_submissions.payload.deliveries` journals `webhook` and `pipeline`
independently. This uses the existing restricted JSONB column; no schema or grant
changes are needed. A compare-and-swap update claims a dispatch so overlapping
requests cannot both send it.

- `pending`: no attempt has started. Missing configuration leaves this recoverable.
- `sending`: an attempt owns the receipt. Overlapping requests do not send again.
- `accepted`: provider returned success. This is ingestion acceptance, not inbox delivery.
- `failed`: provider explicitly rejected the request. Replaying the same submission
  after fixing the cause retries this channel without creating another lead.
- `uncertain`: the network failed, a claim expired, or dispatch acknowledgment could
  not be journaled. The provider may have accepted it. Replays hold rather than
  blindly duplicating notifications. Reconcile Customer.io and reporting-webhook
  evidence using the receipt ID before resetting this state for a controlled retry.
- `legacy_unknown`: an older receipt has no dispatch journal. It is never automatically
  resent; reconcile its historical delivery evidence first.

There is no new scheduled sender. For a controlled replay, an authorized operator
uses the **original** payload and original idempotency key from the restricted
receipt, through the same contact handler. Do not invent a new key or reconstruct
customer data from email templates. Reconcile an uncertain attempt before any
manual reset; never bulk-reset accepted or historical receipts.

A successful saved-lead response can contain a pending/failed delivery state. The
visitor is not asked to resubmit a saved inquiry. Review delivery state separately
from lead persistence, and use Customer.io delivery records plus
`email_delivery_events` to establish email delivery. Exactly-once external delivery
cannot be guaranteed if an acknowledgment is lost.

## Validation

Run `node --test tests/contact-capture.test.mjs tests/lead-form.test.mjs`,
`npm run check:astro`, targeted ESLint/Prettier, and `npx astro build`.
The fixture tests exercise actual compiled handlers with isolated database and
HTTP doubles; they do not send email or touch customer records. Before promotion,
verify the exact preview build and a marked hosted test, including receipt source,
UTM fields, one linked lead, dispatch acceptance and reporting delivery events.
