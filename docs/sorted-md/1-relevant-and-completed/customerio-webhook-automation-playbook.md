# Customer.io Webhook Automation Operational Playbook

This playbook documents verified best practices, debugging workflows, and quirks discovered when integrating ZiaFlow's lead intake endpoint (`/api/contact`) with Customer.io Webhook Automations.

---

## 1. Webhook Automation Architecture
* **Trigger Mechanism:** The incoming webhook payload itself is the trigger subject, not an existing profile. There are no segment entry filters or frequency caps.
* **Liquid Payload Mapping:** Payload keys map directly as `{{trigger.<key>}}` from the top-level JSON body. There is no `data` wrapper.
* **Profile Absence:** `{{customer.*}}` is always empty in webhook automations. All variables (recipient email, name, service, etc.) must be referenced as `{{trigger.*}}`.
* **Profile Persistence:** To create or update an identified person from a webhook, place a **Send Event** step (`client_intake_submitted`) matched on `{{trigger.email}}`.

---

## 2. Liquid Templating Gotchas & Fallbacks
* **Render Crash on Missing Keys:** Bare Liquid variables like `{{trigger.phone}}` will cause the email to fail with an `attempted` error state (`undefined variable: trigger.phone`) if the key is missing or undefined in the JSON payload.
  * *Rule:* Always append fallbacks to optional fields: `{{trigger.phone | default: "not provided"}}`, `{{trigger.source_page | default: "/contact"}}`.
* **The Boolean `false` Quirk:** The Liquid `| default: "..."` filter evaluates boolean `false` as falsy, replacing it with the fallback value (e.g., displaying `"not provided"` instead of `"false"`).
  * *Rule:* For boolean flags like `is_test`, use an explicit conditional:
    ```liquid
    {% if trigger.is_test == true %}true{% else %}false{% endif %}
    ```

---

## 3. Two-Sided Test Filtering (`is_test`)
* **Customer.io Layer:** Start the journey with a conditional branch (**"Is test payload?"**) checking `is_test == true` and routing test traffic to an immediate exit.
* **Website Code Layer (`contact.ts`):** Before dispatching to `CUSTOMER_IO_WEBHOOK_URL`, filter out synthetic test traffic (`if (isTest) return;`) and duplicate replays (`if (alreadyPersisted) return;`).

---

## 4. Controlled Verification Protocol
1. **Send Pair:** Dispatch one payload with `"is_test": false` and one with `"is_test": true` using distinct submission IDs.
2. **Time Correlation:** Customer.io delivery activity logs do not index custom payload keys (`submission_id`). Correlate sends by exact UTC timestamp.
3. **Inspect Delivery State:** Confirm both client confirmation and internal alert show `delivered` (rather than `attempted` or `failed`).
4. **Inspect Inbox:** Verify the rendered values in the received email (follow-up window: *"within 24 business hours"*, footer opt-out line, and `Is test: false`).

---

## 5. Intake Payload Contract
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "602-555-0199",
  "company": "Desert Peak Services",
  "service": "Lead Intake Automation",
  "message": "Project requirements...",
  "inquiry": "Project requirements...",
  "source_page": "https://ziaflow.com/contact",
  "submission_id": "sub_uuid_here",
  "lead_id": "lead_uuid_here",
  "form_type": "contact_us",
  "is_test": false,
```

---

## 6. Downstream Delivery Telemetry (Reporting Webhooks)
* **Ingest Endpoint:** `POST https://ziaflow.com/api/webhooks/customerio`
* **Destination Table:** `public.email_delivery_events`
* **Supported Events:** `email_delivered`, `email_opened`, `email_clicked`, `email_bounced`, `email_failed`, `email_spammed`, `email_unsubscribed`.
* **Configuration in Customer.io:**
  1. Go to **Settings** -> **Workspace Settings** -> **Reporting Webhooks**.
  2. Add Webhook URL: `https://ziaflow.com/api/webhooks/customerio`.
  3. Select events: Delivery, Open, Click, Bounce, Failure, Unsubscribe.
  4. Copy the webhook **Signing Key** and add it as `CIO_WEBHOOK_SIGNING_KEY` in Vercel environment variables.
* **Cryptographic Signature Verification:**
  - Headers read: `X-CIO-Timestamp` and `X-CIO-Signature`.
  - Signed string format: `v0:<timestamp>:<raw body>`.
  - Verification: Computes `crypto.createHmac('sha256', CIO_WEBHOOK_SIGNING_KEY)` over the exact unparsed `request.text()` body and compares with `crypto.timingSafeEqual`.
  - Replay Defense: Rejects requests where `X-CIO-Timestamp` differs from server time by more than 300 seconds (5 minutes).
* **Idempotency:** Events are deduped on `event_id` with Postgres `onConflict: 'event_id', ignoreDuplicates: true`.
