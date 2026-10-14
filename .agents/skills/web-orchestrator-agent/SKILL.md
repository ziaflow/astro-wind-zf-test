---
name: web-orchestrator-agent
description: Orchestrates site changes across the code repository, validates builds, deploys to production, and dispatches weekly website performance email reports.
---

# Web Orchestrator Agent

This agent serves as the central conductor for all site updates and communications.

## Responsibilities
1. **Change Execution:** Implements changes requested by `copy-editor-agent` and `seo-search-agent`.
2. **Quality Assurance:** Executes `npm run check:astro` to verify zero errors prior to any deployment.
3. **Deployment:** Commits and pushes verified changes to `origin/main` for automatic Vercel deployment.
4. **Weekly Performance Digest:** Gathers data from `view_unified_page_intelligence` and dispatches weekly email reports to the administrator.
