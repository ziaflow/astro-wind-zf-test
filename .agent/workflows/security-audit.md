---
description: Perform a comprehensive security audit on Supabase Edge Functions.
---

# Security Audit: Supabase Edge Functions

This workflow guides a Cloud Agent through a thorough security review of all Supabase Edge Functions
in `supabase/functions/`. The goal is to identify vulnerabilities, misconfigurations, and deviations
from security best practices before they reach production.

## 1. Enumerate Edge Functions

**Goal:** Discover all Edge Functions that require review.

**Action:**

1. List all subdirectories under `supabase/functions/`.
2. For each function, record the file path (usually `index.ts`) and note its declared purpose.
3. Flag any function that lacks a clear description or comment header.

---

## 2. Secret & Credential Hygiene

**Goal:** Ensure no secrets are hardcoded in function source code.

**Action:**

1. Search every `index.ts` for patterns that suggest hardcoded credentials:
   - API keys, tokens, passwords directly assigned as string literals.
   - Regex hints: `(?i)(apikey|secret|password|token|key)\s*=\s*['"][^'"]{8,}['"]`
2. Verify that all sensitive values are read from `Deno.env.get(...)` and **never** from string literals.
3. Confirm that `SUPABASE_SERVICE_ROLE_KEY` is used only inside Edge Functions (server-side) and is
   never exposed in client-side code or commit history.
4. Check `.env.example` and repository history (`git log -S <pattern>`) for any accidentally
   committed secrets.
5. **Report:** List any hardcoded secrets found, their file location, and recommended remediation.

---

## 3. Input Validation & Sanitization

**Goal:** Confirm every user-supplied input is validated before use.

**Action:**

1. For each Edge Function that accepts a request body:
   - Verify email addresses are validated with a regex or a well-known library.
   - Verify URL inputs (e.g., `website`) reject non-HTTP/HTTPS schemes to prevent SSRF.
   - Verify string fields have maximum-length checks to prevent abuse.
2. Check that JSON parsing is wrapped in a `try/catch`; unhandled parse errors should not crash the
   function or leak stack traces.
3. **Report:** List any functions missing input validation and the specific fields at risk.

---

## 4. Authentication & Authorization

**Goal:** Ensure functions that access sensitive data are properly protected.

**Action:**

1. Check whether each function requires a valid JWT (`Authorization: Bearer <token>` header).
2. For functions using `SUPABASE_SERVICE_ROLE_KEY`, confirm they do **not** accept arbitrary user
   tokens as a substitute for the service key.
3. Verify that any admin-only operations are guarded by role checks using the Supabase auth helpers.
4. **Report:** List any publicly exposed functions that perform privileged operations without
   authentication.

---

## 5. CORS Configuration

**Goal:** Validate that CORS policies restrict origins appropriately.

**Action:**

1. Locate the `corsHeaders` object (or equivalent) in each function.
2. Verify that `Access-Control-Allow-Origin` is **not** set to `*` in production without a specific
   justification; it should use `Deno.env.get('ALLOWED_ORIGIN')` or a whitelist of known domains.
3. Confirm that allowed methods and headers are as restrictive as necessary (`POST, OPTIONS` only for
   write endpoints).
4. **Report:** List functions with overly permissive CORS and recommended fixes.

---

## 6. Error Handling & Information Disclosure

**Goal:** Prevent stack traces and internal details from leaking to API consumers.

**Action:**

1. Check every `catch` block: it should log the error server-side (`console.error`) but return only a
   generic message (e.g., `"Internal server error"`) to the caller.
2. Confirm that database error objects (e.g., `dbError.message`) are **not** included in HTTP
   response bodies.
3. **Report:** List any functions that expose internal error details to clients.

---

## 7. Row Level Security (RLS) Alignment

**Goal:** Confirm the database layer enforces access controls independently of the application layer.

**Action:**

1. Open `supabase_schema.sql` and verify that every table used by Edge Functions has RLS enabled.
2. For tables written to by Edge Functions using the service-role key, ensure there are **no**
   overly permissive policies that would allow anonymous or authenticated users to bypass controls
   without the service role.
3. **Report:** List any tables missing RLS or containing policies that contradict the intended
   access model.

---

## 8. Dependency & Runtime Security

**Goal:** Verify imported dependencies are from trusted sources and are pinned.

**Action:**

1. For each `import` statement in the Edge Functions, check:
   - Imports from `https://deno.land/std@<version>/` — ensure the version is pinned (not `latest`).
   - Imports from `https://esm.sh/@supabase/supabase-js@<version>` — ensure version is pinned.
   - Any third-party imports — verify the domain is trusted and the version is explicit.
2. Flag any unpinned (`@latest` or missing version) dependencies.
3. **Report:** List all dependencies with their pinned versions and flag any that need updating.

---

## 9. Findings Summary

After completing all checks, produce a structured findings report:

```
## Security Audit Report — Supabase Edge Functions
Date: <YYYY-MM-DD>

### Critical
- [ ] <Finding description, file, line, recommendation>

### High
- [ ] <Finding description, file, line, recommendation>

### Medium
- [ ] <Finding description, file, line, recommendation>

### Low / Informational
- [ ] <Finding description, file, line, recommendation>

### Passed Checks
- [x] <Check name>
```

Post the report as a comment on the GitHub issue and close it if all findings are resolved, or
leave it open with a label of `security:needs-fix` for any unresolved critical or high items.

---

**How to run this workflow:**
Ask the agent: `"Run the Security Audit workflow"` or `"Audit the Supabase Edge Functions"`.
