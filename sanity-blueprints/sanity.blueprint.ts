import { defineBlueprint, defineDocumentWebhook } from '@sanity/blueprints';

const deployHookUrl = process.env.VERCEL_SANITY_DEPLOY_HOOK_URL;

if (
  !deployHookUrl ||
  !/^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\/prj_V02hwQvBcQ94CKZlDQM2nbYiDBL8\/[A-Za-z0-9_-]+$/.test(
    deployHookUrl
  )
) {
  throw new Error('Set VERCEL_SANITY_DEPLOY_HOOK_URL to a deploy hook for astro-wind-zf-test.');
}

export default defineBlueprint({
  resources: [
    defineDocumentWebhook({
      name: 'rebuild-vercel-on-post-change',
      dataset: 'production',
      apiVersion: 'v2026-01-01',
      url: deployHookUrl,
      httpMethod: 'POST',
      on: ['create', 'update', 'delete'],
      includeDrafts: false,
      includeAllVersions: false,
      filter: `before()._type == "post" || after()._type == "post"`,
      projection: '{ "_id": coalesce(after()._id, before()._id) }',
    }),
  ],
});
