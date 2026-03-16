---
name: Security Audit — Supabase Edge Functions
about: Assign a Cloud Agent to perform a security audit on the Supabase Edge Functions
title: "Security Audit: Supabase Edge Functions"
labels: security, cloud-agent
assignees: ''
---

## Overview

A Cloud Agent should perform a comprehensive security audit on all Supabase Edge Functions
located in `supabase/functions/`.

## Scope

- `supabase/functions/contact/index.ts`
- `supabase/functions/submit-audit/index.ts`

## Agent Workflow

The agent should follow the steps defined in
[`.agent/workflows/security-audit.md`](../../.agent/workflows/security-audit.md).

## Checklist

- [ ] Secret & credential hygiene
- [ ] Input validation & sanitization
- [ ] Authentication & authorization
- [ ] CORS configuration
- [ ] Error handling & information disclosure
- [ ] Row Level Security (RLS) alignment
- [ ] Dependency & runtime security

## Expected Output

A structured findings report posted as a comment on this issue, categorised by severity
(Critical, High, Medium, Low/Informational).
