# ZiaFlow Background Agents & Monitoring Engine

This directory contains standalone autonomous agents, scheduled monitors, and data pipelines separated from the Astro web presentation layer.

## Architecture

- **`tools/agents/seo/`**: Content syndication, Sanity blog generation, and Search Console ranking monitors.
- **`tools/agents/monitoring/`**: Clarity analytics extraction, IndexNow submission, and uptime/health pingers.
- **`tools/agents/data/`**: Supabase evidence seeding and transaction sync jobs.

## Environment Variables

Agents execute with elevated access (service roles, private API tokens). They should source credentials from `.env` or secure CI secrets without bundling into the frontend.

## Operational Commands

Run scripts directly via `node tools/agents/...` or through the root `package.json` aliases:

- `npm run sanity:sync`
- `npm run sanity:draft`
- `npm run supabase:sync-seo`
- `npm run indexnow`
