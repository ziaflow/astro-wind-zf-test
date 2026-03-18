# Agent Instructions for Astro-Wind-ZF-Test

## Stack Context
- **Frontend:** Astro.js 5.0 (AstroWind theme)
- **CMS:** Sanity Studio (`/studio-gemini-blog`)
- **Backend:** Supabase (`supabase_schema.sql`)
- **Leads:** Azure Communication Services (ACS)

## Core Directives
1. **Sanity Best Practices:** Use the [Sanity Agent Skills](https://www.sanity.io/blog/introducing-sanity-agent-skills) (GROQ performance, image hotspots) for all schema updates.
2. **Lead Nurturing:** Ensure all forms trigger the `lead-nurture-email` Edge Function.
3. **Performance:** Before committing, run `node scripts/lcp-audit.mjs` on the Vercel preview. Use `fetchpriority="high"` for Hero images.
4. **Tooling:** Prefer [Copilot CLI](https://code.visualstudio.com/docs/copilot/agents/copilot-cli) with **Worktree isolation** for background implementations.
