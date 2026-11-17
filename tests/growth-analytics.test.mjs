import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
const source = readFileSync(new URL('../src/components/growth-tools/GrowthTool.astro', import.meta.url), 'utf8');
const start = source.indexOf('        if (data.duplicate === false &&');
const end = source.indexOf('        output.textContent =\n          data.welcome', start);
assert.ok(start >= 0 && end > start);
const block = stripTypeScriptTypes(source.slice(start, end));
for (const duplicate of [true, false, undefined]) {
  test(`growth analytics with duplicate ${duplicate}`, () => {
    const window = { __zfIsProdHost: true, location: { pathname: '/tools', hostname: 'ziaflow.com' }, dataLayer: [], gtag: (...args) => events.push(args), _cio: { identify: () => events.push('identify'), track: () => events.push('track') } };
    const events = [];
    runInNewContext(block, { data: { duplicate, is_test: false, analytics_eligible: true }, window, events, slug: 'example', tool: { service: 'review' }, fields: { email: 'person@example.com' } });
    assert.equal(events.length, duplicate === false ? 3 : 0);
    assert.equal(window.dataLayer.length, duplicate === false ? 1 : 0);
    if (duplicate === false) assert.equal(window.dataLayer[0].email, undefined);
  });
}
test('growth tracking fails closed for QA, preview and missing confirmation', () => {
  for (const [data, host, flag] of [[{ duplicate:false, is_test:true, analytics_eligible:false }, 'ziaflow.com', true], [{ duplicate:false, is_test:false, analytics_eligible:true }, 'preview.example.com', true], [{ duplicate:false }, 'ziaflow.com', true], [{ duplicate:false, is_test:false, analytics_eligible:true }, 'ziaflow.com', false]]) {
    const window = { __zfIsProdHost: flag, location: { hostname:host, pathname:'/tools' }, dataLayer: [] };
    runInNewContext(block, { data, window, slug:'example', tool:{ service:'review' }, fields:{} }); assert.equal(window.dataLayer.length, 0);
  }
});
