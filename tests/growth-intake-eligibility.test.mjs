import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import { getTool, assess, estimate, stackSummary, VERSION } from '../src/lib/growth-tools/engine.mjs';
const source = readFileSync(new URL('../src/pages/api/growth-tools/intake.ts', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replaceAll('export const ', 'const ');
function endpoint(env, duplicate = false) {
 const module = { exports: {} }; const records = [];
 const supabase = { from(table) { return { async insert(row) { records.push(row); return { error: duplicate && table === 'contact_submissions' ? { code: '23505' } : null }; }, async upsert(row) { records.push(row); return { error: null }; }, update(row) { records.push(row); return { async eq() { return { error: null }; } }; } }; } };
 runInNewContext(stripTypeScriptTypes(source) + '\nmodule.exports = POST;', { module, process: { env }, supabase, sendReviewWelcome: async () => ({ state: 'held' }), checkRateLimit: () => ({ allowed: true }), getTool, assess, estimate, stackSummary, VERSION, logger: { warn(){}, info(){} }, Response, URL, TextDecoder, Uint8Array, console });
 return { post: module.exports, records };
}
for (const [name, env, qa, duplicate] of [['production', 'production', false, false], ['qa', 'production', true, false], ['preview', 'preview', false, false], ['unset', undefined, false, false], ['duplicate', 'production', false, true]]) test(`growth server eligibility: ${name}`, async () => {
 const app = endpoint({ VERCEL_ENV: env }, duplicate); const request = new Request('https://ziaflow.com/api/growth-tools/intake', { method: 'POST', headers: { origin: 'https://ziaflow.com', 'content-type': 'application/json' }, body: JSON.stringify({ id: '123e4567-e89b-42d3-a456-426614174000', tool: 'local-visibility-check', name: qa ? 'ZIAFLOW QA test' : 'Person', email: 'person@business.com', marketingConsent: false, input: { answers: {} } }) });
 const response = await app.post({ request, clientAddress: 'local' }); const body = await response.json(); assert.equal(response.status, 200); assert.equal(body.analytics_eligible === true, name === 'production'); if (!duplicate) assert.equal(body.is_test, name !== 'production');
});
