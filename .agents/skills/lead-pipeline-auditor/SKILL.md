---
name: lead-pipeline-auditor
description: Verify end-to-end lead intake, checking Supabase lead_submissions and leads table insertion, Customer.io webhook/pipeline delivery journals, and SMTP fallback.
---

# Lead Pipeline Auditor Skill

Use this workflow to test and verify that form submissions on ZiaFlow (`/api/contact` and `/api/growth-tools/intake`) properly persist receipts and leads across the stack without triggering unapproved live marketing blasts.

## Pipeline Checkpoints

1. **Client Submission Verification:**
   - Send test payloads to `/api/contact` or `/api/growth-tools/intake` carrying header `x-test-token: $TEST_SUBMISSION_TOKEN` so `is_test = true` is set on the receipt and lead.
   - Verify payload includes: `name`, `email`, `phone`, `service_interest`, `message`, `idempotency_key`, and `page`.

2. **Supabase Receipt & Lead Verification (`lead_submissions` & `leads`):**
   - Query `public.lead_submissions` and `public.leads`:
     ```sql
     SELECT s.id AS submission_id, s.dedup_key, s.status AS receipt_status, s.is_test, s.payload->'deliveries' AS deliveries,
            l.id AS lead_id, l.email, l.service_needed, l.status AS lead_status, l.created_at
     FROM public.lead_submissions s
     LEFT JOIN public.leads l ON l.submission_id = s.id
     ORDER BY s.created_at DESC LIMIT 5;
     ```
   - Confirm `receipt_status = 'persisted'`, `lead_status = 'new'`, and retrying with the same `idempotency_key` returns `duplicate: true` without creating a second row.

3. **Customer.io Delivery Journal & Webhook Telemetry Verification:**
   - For non-test leads, check `lead_submissions.payload.deliveries` (`webhook` and `pipeline` statuses) and `public.email_delivery_events` / `public.ops_lead_intake_delivery` view.
   - Run `node scripts/check-telemetry-freshness.mjs` to inspect operational freshness and failed delivery events.

4. **Internal Alert Verification:**
   - When `SMTP_HOST` and `SMTP_USER` are configured, verify best-effort notification email delivery with `replyTo` set to the submitter's email.
