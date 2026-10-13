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

- **Sync topics queue to the Studio Dashboard:**
  ```powershell
  node scripts/sanity-content-agent.mjs
  ```

---

## 3. SEO Dashboard Integration (`globalSeoDashboard`)

The Sanity Studio includes a singleton document:
* **Schema ID:** `seoDashboard`
* **Document ID:** `globalSeoDashboard`
* **Fields:** `status`, `lastRunTimestamp`, `postingSchedule`, `topicsQueue`, `keywordGaps`.

Always keep this singleton updated whenever new keyword clusters or AI search opportunities are analyzed.
