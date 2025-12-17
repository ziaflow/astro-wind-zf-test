# ZiaFlow AI Agent Operating Manual

## Tech Stack

- **Frontend**: Astro.js (Islands Architecture, SSR enabled)
- **CMS**: Sanity.io (Studio v3)
- **Styling**: Tailwind CSS
- **Assets**: Supabase (All images must use signed 4-year tokens)

## Critical SEO Rules

1. **Topic Clusters**: Every blog post MUST have a `pillar` reference. Never create an "orphan" post.
2. **Metadata**: Use the `<SEO />` component. Title must be < 60 chars; Description < 160 chars.
3. **Internal Linking**: Every 'Spoke' post must link back to its 'Pillar' in the first 200 words.

## Code Style & Safety

- **Images**: Use the `astro:assets` `<Image />` component.
- **Redirects**: Add permanent redirects to `astro.config.mjs` instead of deleting pages.
- **Testing**: Run `npm run build` before proposing changes to ensure the "Broken Link Checker" passes.
- **Boundaries**: Do not modify files in `.github/` or `node_modules/`.

## Commands for Agent

- Build: `npm run build`
- Dev: `npm run dev`
- CMS Update: `npx sanity schema extract`
