# Branch reconciliation and durable intake

Merged the current main into the growth-tools branch locally. Current production visuals/configuration win conflicts; retained the five tools and held acknowledgement logic. Kept main's removal of the obsolete manual Clarity route/script: hosted Edge Function, cron and current scripts are the surviving collector path. No hosted collectors or schedules were changed. Fixed inherited Analytics `var` lint failures.

Contact form now calls /api/contact with a stable submission ID. The server validates JSON, origin, email and bounded fields, then calls the existing service-only record_website_contact RPC. Success requires the matching UUID receipt. Unknown provider responses remain errors; retry keeps the same ID. Browser campaign dispatch was removed. No messaging is performed. Event metadata records form_submit v1 and follow_up_state=held; this is not an implemented Customer.io outbox or delivered acknowledgement.

Intake defaults OFF. Preview/default accepted records are marked is_test=true. To run a controlled preview, configure server-only SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, WEBSITE_INTAKE_ENABLED=true and WEBSITE_INTAKE_TEST_ONLY=true. Do not activate production or messaging through this PR. Production acceptance also needs anti-abuse controls beyond the present honeypot and size/origin validation.

Database validation: service-role transaction submitted the reserved QA ID twice. Result: one receipt and one linked lead. Rolled back and verified zero QA receipts remain. This tests sequential replay; concurrent replay, changed-payload replay and full browser-to-live-database flow remain separate acceptance cases.

Reporting view: a transaction using role anon could count 176 aggregate rows. No personal records were read. Existing owner-permission view and public grants expose internal aggregate reporting; SQL under supabase/review restricts the view to server/service use and enables security_invoker. SQL is proposed, not applied. Current internal agent-ux-optimizer script uses the service-role path. Other external consumers are not inventoried. Do not automatically roll back by reopening public access; correct affected internal consumers to use server authorization.

Further data-quality defects in that legacy view are unchanged: Clarity wildcard joins, test leads included, unknown source data coalesced to zero and GSC impressions compared with GA sessions for a CTR signal. Agents must use source-specific snapshots and privacy-safe evidence views rather than treating this view's health labels as validated recommendations.

Follow-up remains held. Customer.io's draft campaign uses form_submit and already has an appointment_booked global exit. An outbox/dispatch log, provider delivery feed, reply/disqualification exits and runtime suppression tests remain open. No emails, campaign activation, production deployment or database permission changes performed.
