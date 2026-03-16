# Worktree Isolation Strategy

This directory documents how the **#worktree** isolation pattern is applied in this repository so that experimental or multi-agent work never pollutes the `main` branch.

---

## Why Worktrees?

`git worktree` lets you check out multiple branches of the same repo into separate filesystem paths — all sharing one `.git` directory. This means you get:

- **Full isolation** — each agent/feature lives in its own branch and directory
- **No stashing** — your `main` working tree is untouched
- **Parallel execution** — multiple agents can work simultaneously without merge conflicts

---

## Naming Convention

| Agent role        | Branch name pattern                        | Worktree path                     |
|-------------------|--------------------------------------------|-----------------------------------|
| Content Agent     | `worktree/content/<feature>`               | `/tmp/wt-content-<feature>`       |
| Performance Agent | `worktree/perf/<feature>`                  | `/tmp/wt-perf-<feature>`          |
| Ops Agent         | `worktree/ops/<feature>`                   | `/tmp/wt-ops-<feature>`           |
| General           | `worktree/<ticket-id>-<short-description>` | `/tmp/wt-<ticket-id>-<slug>`      |

---

## Quickstart

```bash
# 1. Create a new worktree for the Content Agent
git worktree add -b worktree/content/partnership-pages /tmp/wt-content-partnerships

# 2. Work inside the worktree
cd /tmp/wt-content-partnerships
# ... make changes, commit ...

# 3. Push the branch
git push origin worktree/content/partnership-pages

# 4. Open a PR from the worktree branch → main
# After merge, clean up:
git worktree remove /tmp/wt-content-partnerships
git branch -d worktree/content/partnership-pages
```

---

## Active Worktrees for This Iteration

| Agent             | Branch                                               | Status     |
|-------------------|------------------------------------------------------|------------|
| Content Agent     | `copilot/worktree-partnership-pages-and-audit`       | ✅ Active  |
| Performance Agent | `copilot/worktree-partnership-pages-and-audit`       | ✅ Active  |
| Ops Agent         | `copilot/worktree-partnership-pages-and-audit`       | ✅ Active  |

All three agents were batched into a single feature branch for this iteration. In multi-team scenarios each agent would have its own dedicated worktree branch.

---

## Artifacts Produced

### Content Agent
- `sanity/schemas/partnershipPage.js` — Sanity document type for partnership pages
- `sanity/schemas/index.js` — Updated to register the new schema
- `src/pages/partners/index.astro` — Listing page (fetches from Sanity)
- `src/pages/partners/[slug].astro` — Dynamic detail page (fetches from Sanity)

### Performance Agent (LCP Audit Findings & Fixes)
- **Finding:** Hero component `<Image>` lacked `fetchpriority="high"`, causing delayed LCP paint because the browser had to wait for layout before assigning download priority.
- **Fix:** `src/components/widgets/Hero.astro` — added `fetchpriority="high"` alongside existing `loading="eager"` on the Hero image.
- **Finding:** Blog post main image (`src/pages/posts/[slug].astro`) was loaded without `loading="eager"` or `fetchpriority`, even though it is the above-the-fold LCP element on every post page.
- **Fix:** Added `loading="eager"` and `fetchpriority="high"` to the post main image.

### Ops Agent
- `supabase/functions/lead-nurturing-email/index.ts` — Supabase Edge Function that:
  - Receives a Database Webhook trigger on `INSERT` to `public.contact_submissions`
  - Builds a personalised nurture HTML + plain-text email
  - Signs and sends the email via the **Azure Communication Services** REST API (HMAC-SHA256)
- `supabase/config.toml` — Supabase local development configuration with the edge function registered

---

## Deploying the Edge Function

```bash
# Deploy to your linked Supabase project
supabase functions deploy lead-nurturing-email --no-verify-jwt

# Set secrets (run once)
supabase secrets set \
  ACS_ENDPOINT="https://<your-resource>.communication.azure.com" \
  ACS_ACCESS_KEY="<base64-access-key>" \
  ACS_SENDER_ADDRESS="DoNotReply@<subdomain>.azurecomm.net" \
  NURTURE_FROM_DISPLAY="ZiaFlow Team" \
  NURTURE_REPLY_TO="hello@ziaflow.com"
```

Then create a Database Webhook in the Supabase Dashboard:
- **Table:** `public.contact_submissions`  
- **Events:** `INSERT`  
- **Webhook URL:** `https://<project-ref>.supabase.co/functions/v1/lead-nurturing-email`
