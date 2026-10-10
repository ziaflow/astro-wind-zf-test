# Intake Form Pipeline

```
<ContactIntakeForm>  ──JS──▶  Astro Action `submitInquiry`  ─┐
        │                                                    ├─▶ processSubmission()  (src/lib/forms/submit.ts)
        └──no JS──▶  POST /forms/submit (on-demand page)  ───┘      1. rate limit (5 / 60s / IP, in-memory)
                                                                    2. allowlist form_id + form_type
                                                                    3. honeypot hp_token must be empty
                                                                    4. ≥ 3s fill time (when JS set the timestamp)
                                                                    5. schema validation (definitions.ts)
                                                                    6. Supabase contact_submissions (dedupe on submission_id)
                                                                    7. Google Sheet via Apps Script (idempotent on submissionId)
                                                                    8. internal email (failure never loses the lead)
```

| File                                           | Role                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| `src/lib/forms/definitions.ts`                 | Single schema: fields, labels, sheet tabs, allowlist (`FORM_DEFINITIONS`) |
| `src/lib/forms/validation.ts`                  | Pure validation (allowlist, honeypot, timing, fields, attachment)         |
| `src/lib/forms/submit.ts`                      | Server pipeline; reads secrets via `astro:env/server`                     |
| `src/lib/forms/rate-limit.ts`                  | Per-IP limiter (swap for Upstash if spam persists)                        |
| `src/actions/index.ts`                         | `submitInquiry` Astro Action (`accept: 'form'`)                           |
| `src/pages/forms/submit.astro`                 | No-JS POST target (`prerender = false`, noindex)                          |
| `src/components/forms/ContactIntakeForm.astro` | Reusable form, `<ziaflow-contact-form>` custom element                    |
| `src/components/common/UtmCapture.astro`       | Stores utm\_\* / gclid in sessionStorage (in `Layout.astro`)              |
| `google-apps-script/Code.gs`                   | Sheet writer + Drive attachments                                          |

## Adding a form

1. Add a key to `FORM_DEFINITIONS` (required core fields stay: name, email, company, phone, inquiry_type, message).
2. `<ContactIntakeForm id="unique-dom-id" formId="your-key" />` — `id` must be unique on the page.

## Configuration

| Variable                                                                   | Where                       | Notes                                                                                                     |
| -------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `GOOGLE_SCRIPT_URL`                                                        | Vercel Production + Preview | Apps Script `/exec` URL. **Required** — submissions 500 without it                                        |
| `GOOGLE_SCRIPT_SECRET`                                                     | Vercel Production + Preview | Same value as Script Property `SHARED_SECRET` (≥ 32 random chars)                                         |
| `SUPABASE_URL`, `SUPABASE_KEY`                                             | Vercel                      | Optional but recommended (durable record). Key needs INSERT (and ideally SELECT) on `contact_submissions` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO` | Vercel                      | Optional; internal notification                                                                           |

Never prefix any of these with `PUBLIC_`.

### Apps Script deployment

1. Google Sheet → Extensions → Apps Script → paste `google-apps-script/Code.gs`.
2. Project Settings → Script Properties → `SHARED_SECRET`.
3. Run `setup()` once; approve permissions.
4. Deploy → Web app → Execute as **Me** → Access **Anyone** → copy the `/exec` URL.
5. Add `GOOGLE_SCRIPT_URL` / `GOOGLE_SCRIPT_SECRET` to Vercel (Production + Preview), then redeploy.

## Local testing

- Use the exact origin the dev server prints (e.g. `http://localhost:4321`). Requests from `127.0.0.1` to a
  `localhost` server fail the origin check with "Cross-site POST form submissions are forbidden".
  **Fix the test origin — never set `security.checkOrigin: false`.**
- Keep `adapter: vercel()`. Do not swap in `@astrojs/node` for local tests; `astro dev` works with the Vercel adapter.
- Point `GOOGLE_SCRIPT_URL` at a **copy** of the sheet for testing.

## Deployment gate (all must pass before merging to `main`)

- [ ] `astro.config.ts` uses `@astrojs/vercel` and `security.checkOrigin: true`
- [ ] `GOOGLE_SCRIPT_URL` + `GOOGLE_SCRIPT_SECRET` set in Vercel Production **and** Preview
- [ ] Feature branch → PR → Vercel Preview validated end-to-end:
  - [ ] JS submission creates one timestamped row (and a Supabase row if configured)
  - [ ] No-JS submission (disable JS) lands on `/forms/submit` with success and creates a row
  - [ ] Blank required fields rejected server-side (e.g. `curl` without `company` → 400)
  - [ ] Unknown `form_id` → 400
  - [ ] Re-submitting the same `submission_id` does not create a duplicate row
  - [ ] Filled honeypot → fake success, no row
  - [ ] 6th request within 60s from one IP → 429
  - [ ] Wrong SMTP password → submission still succeeds and row exists
  - [ ] Attachment ≤ 3 MB appears as a Drive HYPERLINK; > 3 MB rejected
  - [ ] Cross-origin form POST → 403
  - [ ] Client bundle contains no `GOOGLE_SCRIPT` values (`grep -r "script.google" .vercel/output/static` is empty)
  - [ ] dataLayer `generate_lead` event contains no name/email/phone/company/message
- [ ] Rollback plan below acknowledged

## Rollback plan

1. **Fastest:** Vercel → Deployments → previous production deployment → _Promote to Production_ (instant, no rebuild).
2. **Code:** `git revert -m 1 <merge-commit>` on a branch → PR → merge.
3. **Sheet/script issues only:** in Apps Script, Manage deployments → roll back to the previous version
   (URL unchanged). Submissions are still saved to Supabase while the sheet is down.
4. Leads received during an incident are recoverable from Supabase `contact_submissions` and Vercel function logs
   (logs contain submission IDs only).
