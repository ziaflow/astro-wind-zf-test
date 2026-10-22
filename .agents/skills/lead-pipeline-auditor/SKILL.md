---
name: lead-pipeline-auditor
description: Verify end-to-end lead intake, checking Supabase leads table insertion, customer.io event triggering, and SMTP delivery.
---

# Lead Pipeline Auditor Skill

Use this workflow to test and verify that form submissions on ZiaFlow properly generate leads across the entire marketing stack.

## Pipeline Checkpoints

1. **Client Submission Verification:**
   - Test submitting test payloads to `/api/contact` using `fetch` or browser subagent.
   - Verify payload includes: `name`, `email`, `phone`, `service_interest`, and `message`.

2. **Supabase Record Verification:**
   - Query `public.leads` for the submitted email:
     ```sql
     SELECT id, name, email, phone, service_needed, status, score, created_at 
     FROM public.leads 
     WHERE email = 'test-lead@ziaflow.com' 
     ORDER BY created_at DESC LIMIT 1;
     ```
   - Confirm status is set to `'new'` and initial score is recorded.

3. **Customer.io Trigger Verification:**
   - Confirm `contact_form_submitted` payload matches Customer.io Campaign ID 3:
     - `customer.email`
     - `customer.first_name`, `customer.last_name`
     - `customer.phone`
     - `customer.service_interest`
     - `event.message`
     - `event.page_url`

4. **Internal Alert Verification:**
   - Check SMTP transmission log or inbox to confirm notification delivery with reply-to set to the lead email.
