---
name: sanity-blog-agent
description: Specialized workflow for managing Sanity Studio, syndicating blog posts, and updating the SEO Automation Dashboard using real-time search & citation data.
---

# Sanity Blog & SEO Agent Skill

This skill guides the AI assistant in managing Sanity content lake (`projectId: 92p0tpps`), maintaining the **SEO Automation Dashboard** (`globalSeoDashboard`), and drafting high-citation blog posts that target Bing Copilot AI queries and Google Search intent.

---

## 1. High-Priority Content Clusters (AI Citations & Local Demand)

When drafting or refreshing blog articles in Sanity or Markdown (`src/data/post`):

1. **Intelligent Website Assistants / Bounce Rate Reduction:**
   * **Target:** Queries around *"intelligent website assistant reduce visitor bounce"*, *"ai bounce rate reduction"*.
   * **Format:** Provide step-by-step implementations, real ROI figures, and interactive widget examples.
   * **Goal:** Expand on Ziaflow's 180+ Bing Copilot AI citations.

2. **Microsoft Ads 2026 Evaluation:**
   * **Target:** *"Microsoft Ads app advertising evaluation"*, *"Microsoft Ads for Apple Business"*.
   * **Goal:** Defend and grow Ziaflow's 39% AI Citation Share. Emphasize Copilot ad formats, multimedia ads, and B2B comparison points.

3. **Phoenix AI-Native SMB Development:**
   * **Target:** *"local development companies in the phoenix area specialize in fast ai-native builds for small businesses"*, *"phoenix ai web agency"*.
   * **Goal:** Convert Page-1 impressions on Google into inbound agency leads.

---

## 2. Managing Sanity Studio

The authoritative studio is located at:
`c:\Users\jerem\astro-wind-zf-test\studio-gemini-blog`
Deployed at: `https://ziaflow.sanity.studio/`

### Common Studio Operations

- **Extract schema & manifest:**
  ```powershell
  cd studio-gemini-blog
  npx sanity schema extract
  npx sanity manifest extract
  ```

- **Deploy studio updates:**
  ```powershell
  cd studio-gemini-blog
  npx sanity deploy
  ```

- **Run the Sanity Content & SEO Agent:**
  ```powershell
  # 1. Review all posts across local files and Sanity, auditing quality and daily 3-post rate limit
  npm run sanity:review

  # 2. Sync topics queue and keyword gaps to Studio Dashboard
  npm run sanity:sync

  # 3. Automatically generate next high-citation draft post directly in Sanity Studio
  npm run sanity:draft

  # 4. Draft all queued high-priority topics
  npm run sanity:draft-all

  # 5. Safely publish next post (strictly blocked if >=3 posts published today)
  npm run sanity:publish-safe

  # 6. View latest drafts and published posts in Sanity
  npm run sanity:list
  ```

### Quality Gateway & Anti-Spam Guardrails
To safeguard ZiaFlow's search reputation, ensure authentic human oversight, and strictly comply with Google's Scaled Content Abuse policies:
- **Weekly Volume Cap:** Maximum **3 blog posts per rolling 7-day window** (across both Sanity and local Markdown/MDX).
- **Mandatory Quality Gateway Validation:** Before running `npm run sanity:publish-safe`, every article MUST pass three checks:
  1. **Named Human Reviewer:** Must specify a verified human reviewer/author (e.g. `Jeremy (ZiaFlow Engineering Lead)`). Anonymous or AI attributions trigger auto-demotion.
  2. **Original Proof Asset:** Must contain at least one verifiable, original asset (`client_data`, `screenshot`, `benchmark_data`, `code_sample`, or `custom_diagram`). Merely crediting external sources is insufficient.
  3. **Fact-Check Verification:** All statistical claims (e.g. CPC ranges, conversion multipliers) must be explicitly cited and dated.
- **Auto-Draft Demotion:** Any article failing the Quality Gateway or exceeding the 3-post weekly volume cap is safely demoted to `draft` status to prevent manual search action.
- **Quality Audit:** `npm run sanity:review` audits all local and Sanity posts against the Quality Gateway rules.

---

## 3. SEO Dashboard Integration (`globalSeoDashboard`)

The Sanity Studio includes a singleton document:
* **Schema ID:** `seoDashboard`
* **Document ID:** `globalSeoDashboard`
* **Fields:** `status`, `lastRunTimestamp`, `postingSchedule`, `topicsQueue`, `keywordGaps`.

Always keep this singleton updated whenever new keyword clusters or AI search opportunities are analyzed.

---

## 4. Live Unified Blog Pipeline (Sanity + Astro)

Published posts in Sanity Studio (`_type == "post" && !(_id in path("drafts.**")) && publishedAt <= now()`) are automatically queried and unified directly into the main Astro blog architecture via [src/utils/blog.ts](file:///c:/Users/jerem/astro-wind-zf-test/src/utils/blog.ts).

- **Route:** `/[...blog]` (e.g., `https://ziaflow.com/<slug>`)
- **Rendering:** [src/pages/[...blog]/index.astro](file:///c:/Users/jerem/astro-wind-zf-test/src/pages/[...blog]/index.astro) dynamically renders Portable Text blocks via `astro-portabletext`.
- **Image Optimization:** Uses Sanity CDN (`cdn.sanity.io`) configured in `astro.config.ts`.
- **Deduplication:** If a slug collision exists between a local file in `src/data/post/` and Sanity, the local file takes precedence.

---

## 5. Automated Search & Analytics Intelligence (Supabase + GitHub Actions)

Real-time search queries and UX telemetry are stored in Supabase PostgreSQL:
- **`gsc_search_queries`**: Historical Search Console query rankings, impressions, and striking-distance priority scores (1-10).
- **`ga4_page_metrics`**: Landing page sessions, bounce rates, and conversion counts.
- **`clarity_ux_metrics`**: Rage clicks, dead clicks, and UX friction scores from Microsoft Clarity.
- **`seo_agent_sync_logs`**: Sync status and opportunity counts.

### Scheduled Updates
- **GitHub Action Workflow:** [.github/workflows/scheduled-seo-sync.yml](file:///c:/Users/jerem/astro-wind-zf-test/.github/workflows/scheduled-seo-sync.yml) runs every 12 hours (`0 0,12 * * *`).
- **Manual Trigger:**
  ```powershell
  npm run supabase:sync-seo
  ```
