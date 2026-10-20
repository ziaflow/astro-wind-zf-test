# ZiaFlow Production Web Platform

Production codebase for **[ZiaFlow](https://ziaflow.com)**, an Arizona-based technology, web engineering, automation, and search intelligence company.

> **Internal repository:** `astro-wind-zf-test` is the authoritative source for the live ziaflow.com site. Treat `main` as production.

## Stack

| Layer                 | Technology                                     |
| :-------------------- | :--------------------------------------------- |
| Framework             | Astro 5 (`@astrojs/vercel` serverless adapter) |
| Styling               | Tailwind CSS                                   |
| Headless CMS          | Sanity Studio (`studio-gemini-blog/`)          |
| Database              | Supabase Postgres                              |
| Marketing & Analytics | Customer.io CDP, Microsoft Clarity, IndexNow   |
| Hosting               | Vercel (Production deployment on `main`)       |

The site started from the open-source [AstroWind](https://github.com/arthelokyo/astrowind) template (MIT). It has since been customized heavily.

## Repository Layout

```
/
├── src/
│   ├── pages/              # Public site routes & SSR API endpoints
│   ├── components/         # Astro & UI components
│   ├── layouts/            # Page layouts and base HTML structures
│   ├── data/               # Blog posts (.md, .mdx)
│   ├── assets/styles/      # tailwind.css & typography tokens
│   ├── config.yaml         # Site, SEO, blog, and analytics settings
│   └── navigation.ts       # Global header & footer navigation trees
├── studio-gemini-blog/     # Sanity Studio (headless blog CMS)
├── tools/agents/           # Autonomous agents, background sync jobs, & IndexNow scripts
│   └── migrations/         # Supabase database migrations (01, 02)
├── docs/architecture/      # Architecture and intake pipeline documentation
├── public/                 # Static assets, robots.txt, IndexNow verification keys
├── astro.config.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (`^18.17.1 || ^20.3.0 || >= 21.0.0`)
- npm
- Access to the Sanity project (`92p0tpps`), Supabase project, and Customer.io workspace

### Setup

```bash
git clone https://github.com/ziaflow/astro-wind-zf-test.git
cd astro-wind-zf-test
npm install
cp .env.example .env   # then fill in required secrets
npm run dev            # http://localhost:4321
```

### Commands

| Command                     | Action                                                           |
| :-------------------------- | :--------------------------------------------------------------- |
| `npm run dev`               | Start local Astro dev server at `localhost:4321`                 |
| `npm run build`             | Build production site to `./dist/`                               |
| `npm run preview`           | Preview production build locally                                 |
| `npm run check`             | Run all checks (`check:astro`, `check:eslint`, `check:prettier`) |
| `npm run check:astro`       | Type-check Astro templates and component props                   |
| `npm run fix`               | Auto-format and lint fix (`fix:eslint`, `fix:prettier`)          |
| `npm run sanity`            | Start local Sanity Studio dev server (`localhost:3333`)          |
| `npm run sanity:sync`       | Sync and syndicate published posts from Sanity                   |
| `npm run supabase:sync-seo` | Run the SEO search intelligence synchronization job              |
| `npm run indexnow`          | Submit updated sitemaps to Bing and search engines via IndexNow  |

## Environment Variables

Copy `.env.example` to `.env`. Never commit real keys. Store production secrets in Vercel project environment variables.

| Variable                             | Purpose                                                         |
| :----------------------------------- | :-------------------------------------------------------------- |
| `EMAIL_BACKEND`                      | `web3forms` (default) or `nodemailer`                           |
| `WEB3FORMS_ACCESS_KEY`               | Required if using Web3Forms                                     |
| `SMTP_*`                             | Host, port, user, pass (required if `EMAIL_BACKEND=nodemailer`) |
| `SANITY_PROJECT_ID`                  | Sanity CMS Project ID (`92p0tpps`)                              |
| `SANITY_DATASET`                     | Sanity dataset (e.g., `production`)                             |
| `SANITY_API_TOKEN`                   | Sanity write/management token for content agents                |
| `SUPABASE_URL`                       | Supabase Postgres URL endpoint                                  |
| `SUPABASE_KEY` / `SUPABASE_ANON_KEY` | Client-accessible Supabase anonymous key                        |
| `SUPABASE_SERVICE_ROLE_KEY`          | Server-only private key for backend lead insertion              |
| `INDEXNOW_KEY`                       | Search engine ping key for instantaneous search indexing        |
| `CLARITY_API_TOKEN`                  | Microsoft Clarity analytics extraction token                    |

## Subsystems

### Sanity Studio (`studio-gemini-blog/`)

Blog articles, structured content, and author metadata are managed here and queried dynamically by the Astro site via `@sanity/astro` and `@sanity/client`.

```bash
cd studio-gemini-blog
npm install
npm run dev        # http://localhost:3333
npm run deploy     # Deploy changes to Sanity hosted studio
```

### Agents and Background Jobs (`tools/agents/`)

Autonomous agents, data pipelines, and scheduled sync jobs. Database schema definitions live in `tools/agents/migrations/`:

- `01_lead_to_delivery_schema.sql`: Lead ingestion, CRM status tracking, and notification logs.
- `02_analytics_warehouse_schema.sql`: Clarity sessions, SEO keyword positions, and traffic warehouse.

Apply migrations in order against Supabase before deploying code that depends on them.

### Architecture Docs

See [`docs/architecture/`](./docs/architecture/) for lead ingestion pipelines, Customer.io integration, and edge routing specifications.

## Configuration

- **Site, SEO, blog, and analytics:** `src/config.yaml`
- **Navigation menus (Header & Footer):** `src/navigation.ts`
- **Design tokens & styling:** `src/components/CustomStyles.astro` and `src/assets/styles/tailwind.css`
- **Theme control:** Default is high-contrast light mode (`theme: 'light:only'`).

## Deployment

1. Run `npm run check:astro` and `npm run build` locally to verify 0 errors.
2. Push commits to `main`.
3. Vercel automatically deploys production builds upon git push to `main`.
4. Apply any pending Supabase migrations via the Supabase SQL editor or CLI.
5. Post-build automatically pings Bing/IndexNow with the updated sitemap.

## Credits and License

Built on [AstroWind](https://github.com/arthelokyo/astrowind) by Arthelokyo and its contributors, under the MIT license. See [LICENSE.md](./LICENSE.md). ZiaFlow-specific code, proprietary automation agents, and content are proprietary to ZiaFlow unless stated otherwise.
