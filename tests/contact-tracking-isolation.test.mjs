import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
for (const file of ['src/components/common/AIFloatingMenu.astro','src/components/widgets/AuditBookingForm.astro','src/kairo/components/animation/init/sales-form.ts','src/kairo/components/animation/init/short-lead-form.ts']) {
 test(`${file} continues after a tracking exception`, () => {
  const source = readFileSync(file, 'utf8'); const start = source.indexOf('if (body && typeof body.submission_id'); const end = source.indexOf('} catch { /* Tracking must not affect a saved submission. */ }', start); assert.ok(start >= 0 && end > start);
  const code = stripTypeScriptTypes(source.slice(start, end) + '} catch { }\n} succeeded = true;'); const window = { __zfIsProdHost: true, location: { hostname: 'ziaflow.com', pathname: '/contact' }, dataLayer: { push() { throw Error('tracking'); } } }; const context = { window, body: { submission_id:'id', duplicate:false, is_test:false, analytics_eligible:true }, payload: {}, serviceInterest:'', company:'', size:'', email:'', name:'', phone:'', succeeded:false }; runInNewContext(code, context); assert.equal(context.succeeded, true);
 });
}
