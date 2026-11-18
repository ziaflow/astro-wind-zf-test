# Scheduled Sanity posts

Sanity Studio schedules publication. The Blueprint sends published post changes to the Vercel Deploy Hook so Astro rebuilds the static `/posts` archive and article pages from the latest published content. Draft edits and edits to scheduled versions do not request builds.

## Activate after production approval

1. In the Vercel project `astro-wind-zf-test`, open **Settings → Git → Deploy Hooks**. Reuse the site's dedicated Sanity hook for `main` if one exists, or create one. Store the URL as a secret and pass it to the CLI process as `VERCEL_SANITY_DEPLOY_HOOK_URL`. Keep it out of Git and shared command output.
2. In `sanity-blueprints/`, install the pinned dependencies with `npm ci`. Authenticate privately with `npx sanity@latest login`, then run `npx sanity@latest blueprints stacks --project-id 92p0tpps`. If the publishing stack is absent, initialize it with `npx sanity@latest blueprints init . --project-id 92p0tpps --stack-name website-publishing`.
3. Run `npx sanity@latest blueprints plan --project-id 92p0tpps --stack website-publishing`. Review the plan privately and confirm it only creates or updates `rebuild-vercel-on-post-change` before running `npx sanity@latest blueprints deploy --project-id 92p0tpps --stack website-publishing`. Reuse an existing Blueprint stack only if it is dedicated to this webhook. Check Sanity Manage for an existing equivalent webhook before deploying to avoid duplicate builds.

## Schedule and verify one post

1. In Studio, open an approved draft and check its slug, byline, canonical URL, and metadata. Set the post's **Published at** field to the intended publication time or earlier. Astro filters the archive and article routes by this field.
2. From the document actions menu next to **Publish**, select **Schedule publish** and confirm the intended time in `America/Phoenix`. Scheduled drafts require Sanity Growth and Studio 4.14 or later. Use a Content Release if several approved posts must go live together.
3. After the scheduled time, check that Sanity published the release, the webhook delivery succeeded, and the Vercel deployment from `main` is **Ready**. Verify the article and its archive entry at `https://ziaflow.com/posts`. Allow for build time between the scheduled publication and the website update.

[Sanity scheduled drafts](https://www.sanity.io/docs/studio/scheduled-drafts) · [Sanity Blueprint webhooks](https://www.sanity.io/docs/blueprints/blueprints-webhook) · [Vercel Deploy Hooks](https://vercel.com/docs/deploy-hooks)
