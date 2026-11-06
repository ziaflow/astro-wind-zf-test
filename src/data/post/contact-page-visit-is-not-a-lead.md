---
title: 'A Contact Page Visit Is Not a Lead: A Website Tracking Checklist'
draft: true
category: 'Measurement'
tags: ['lead tracking', 'Arizona businesses', 'website forms']
excerpt: 'A reproducible checklist for separating contact-page visits, attempted submissions, saved inquiries, and qualified opportunities.'
metadata:
  title: 'Contact Page Visits vs. Saved Leads: A Tracking Checklist'
  description: 'Test your form and analytics together. Separate page visits, failed attempts, saved inquiries, duplicates, and internal QA events.'
---

A website can report conversions while the inbox stays quiet. Before changing the offer or increasing advertising spend, define what the conversion event actually means.

For an Arizona service business, a useful sequence is: someone visits a service page, attempts to contact the business, the system accepts the inquiry, a person reviews it, and the request either progresses or closes. Those are different events. A tracking setup should preserve those distinctions.

## Write the event contract first

A `contact_page_view` describes a visit. A `form_attempt` describes an action that may fail. A `generate_lead` event should have a documented business definition. In a receipt-based implementation, the browser receives a new inquiry identifier only after the server accepts the request.

That identifier allows the implementation to distinguish a successful new request from a repeated submission. It does not establish that the person is a qualified prospect or that a meeting happened.

## Run the five-state test

Use an internal QA mode and a synthetic address approved for testing. Suppress external follow-up unless that delivery test is separately authorized.

| Test                              | Expected inquiry result    | Expected business conversion |
| --------------------------------- | -------------------------- | ---------------------------- |
| Open the contact page             | No receipt                 | None                         |
| Submit invalid required fields    | No accepted receipt        | None                         |
| Simulate a failed server response | Show a recoverable error   | None                         |
| Accept a valid new inquiry        | One saved receipt          | One eligible event           |
| Retry the same accepted request   | Reuse the existing receipt | No extra event               |

Repeat the test on mobile and on a preview deployment. An internal test must not become evidence of new customer demand simply because it returned a success message.

## Reconcile the systems without inventing precision

Analytics events, call records, email delivery logs, and database receipts can have different identifiers and reporting boundaries. Record the property, hostname, dates, timezone, and exclusions next to each comparison.

If historical analytics never recorded the receipt identifier, matching a day’s event count to a day’s saved inquiries cannot prove an individual match. Report that limitation. Do not turn an aggregate correlation into a confirmed customer journey.

## Turn the finding into a repair

Inspect the website handler, tag-manager trigger, and analytics-created event rules. A page-load trigger can continue firing even when the form handler is correct. After the repair, repeat the five-state test and record the date so historical and corrected measurements remain distinguishable.

Use the [PPC audit scope](/services/ppc-audit) when paid accounts depend on the event. For the implementation work, start with [performance tracking](/services/performance-tracking) and [CRM ownership](/services/crm).
