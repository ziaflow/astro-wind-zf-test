import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/pages/api/forms/audit.ts', import.meta.url), 'utf8').replaceAll(
  'import.meta.env',
  'process.env'
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

test('audit rate limit rejects before reading a body or sending email', async () => {
  let sends = 0;
  const providers = {
    nodemailer: { default: { createTransport: () => ({ sendMail: async () => sends++ }) } },
    '~/lib/communications': { logCommunication: async () => {} },
    '~/lib/forms/rate-limit': {
      checkRateLimit: (address) => {
        assert.equal(address, '192.0.2.2');
        return { allowed: false, retryAfterSeconds: 45 };
      },
    },
  };
  const exports = {};
  runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.ok(name in providers, `Unexpected dependency ${name}`);
      return providers[name];
    },
    process: { env: {} },
    console,
    Response,
  });
  const response = await exports.POST({
    clientAddress: '192.0.2.2',
    request: { json: () => assert.fail('Blocked request body must not be read') },
  });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '45');
  assert.equal(sends, 0);
});
