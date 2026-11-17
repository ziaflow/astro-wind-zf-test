# Lead analytics reliability

Contact analytics require a new persisted receipt, a server-confirmed non-test eligibility flag, and a production hostname. Existing receipts remain ineligible even when a retry completes an earlier unfinished receipt. Growth-tool retries do not emit analytics.

This is fail-closed, not an exactly-once guarantee. If persistence succeeds but the response is lost, the retry is ineligible and the event can be missed. Browser closure, blocked scripts, and analytics failures can also lose events. The receipt insert and lead persistence are separate operations, and there is no atomic analytics dispatch or durable event outbox; a successful browser push does not prove downstream receipt.

Growth tracking requires a new receipt, a server-confirmed non-test flag and a production browser host. The growth intake marks names beginning `ZIAFLOW QA` and non-production or unknown Vercel environments as test. Browser-side QA exclusions also apply.

The generic form can use Web3Forms, whose success response does not establish contact receipt eligibility. On a successful Web3Forms response, it emits only a `contact_form_submitted_unverified` Customer.io event without identifying the submitter on a production browser; it does not identify a person or emit the existing production lead event. Existing Customer.io automations listening for `contact_form_submitted` will not receive these Web3Forms submissions unless separately adapted. Web3Forms delivery itself is unchanged. An existing browser identity may still be associated with that event. The event can still be lost if tracking fails.
