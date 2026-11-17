import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
for (const path of ['../src/components/common/AIFloatingMenu.astro', '../src/components/widgets/AuditBookingForm.astro', '../src/kairo/components/animation/init/sales-form.ts', '../src/kairo/components/animation/init/short-lead-form.ts']) {
  test(`${path} requires a complete eligible receipt`, () => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    const match = source.match(/if \((!?\(?)(body|data) && typeof \2\.submission_id[^\n]+/);
    assert.ok(match);
    let expression = match[0].slice(4);
    if (path.includes('/ui/Form.astro')) expression = expression.slice(2, expression.indexOf('))) throw') + 1);
    else expression = expression.slice(0, expression.lastIndexOf(')'));
    expression = stripTypeScriptTypes(`const eligible = ${expression};`)+ '\neligible';
    const allowed = { submission_id: 'id', duplicate: false, is_test: false, analytics_eligible: true };
    const evaluate = (body, hostname = 'ziaflow.com') => runInNewContext(expression, { body, data: body, window: { __zfIsProdHost: true, location: { hostname } } });
    assert.equal(evaluate(allowed), true);
    for (const body of [null, {}, { ...allowed, duplicate: true }, { ...allowed, is_test: true }, { ...allowed, analytics_eligible: undefined }, { ...allowed, submission_id: 123 }]) assert.equal(Boolean(evaluate(body)), false);
    assert.equal(evaluate(allowed, 'preview.example.com'), false);
  });
}
