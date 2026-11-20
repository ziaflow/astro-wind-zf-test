import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

for (const name of ['sync-google-metrics', 'sync-customerio']) {
  test(`${name} requires the configured bearer secret`, async () => {
    const source = readFileSync(new URL(`../src/pages/api/cron/${name}.ts`, import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    const module = { exports: {} };
    let calls = 0;
    const env = {};
    runInNewContext(compiled, {
      module,
      exports: module.exports,
      require: () => ({ run: async () => calls++ }),
      process: { env },
      Response,
      fetch: () => assert.fail('unexpected network request'),
    });
    const invoke = (authorization) => {
      const request = new Request('https://example.test/api/cron', {
        headers: authorization ? { authorization } : {},
      });
      return module.exports.GET({ request, url: new URL(request.url) });
    };
    assert.equal((await invoke()).status, 401);
    assert.equal((await invoke('Bearer undefined')).status, 401);
    env.CRON_SECRET = 'test-secret';
    assert.equal((await invoke()).status, 401);
    assert.equal((await invoke('Bearer wrong')).status, 401);
    assert.equal(calls, 0);
    assert.equal((await invoke('Bearer test-secret')).status, 200);
    assert.equal(calls, 1);
  });
}
