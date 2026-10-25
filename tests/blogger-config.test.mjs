import test from 'node:test';
import assert from 'node:assert/strict';
import { getBloggerConfig } from '../scripts/blogger-config.mjs';
const base = { OPENAI_API_KEY: 'test-only', BLOGGER_MODEL: 'deployment' };
test('OpenAI mode does not receive Azure headers or API version', () => {
  const config = getBloggerConfig({ ...base, BLOGGER_PROVIDER: 'openai' });
  assert.equal(config.options.defaultHeaders, undefined);
  assert.equal(config.options.defaultQuery, undefined);
  assert.equal(config.options.maxRetries, 0);
});
test('Azure uses resource endpoint, deployment and explicit API version', () => {
  const config = getBloggerConfig({
    ...base,
    BLOGGER_PROVIDER: 'azure',
    OPENAI_API_BASE: 'https://example.openai.azure.com/',
    AZURE_OPENAI_API_VERSION: 'test-version',
  });
  assert.equal(config.options.endpoint, 'https://example.openai.azure.com');
  assert.equal(config.options.deployment, 'deployment');
  assert.equal(config.options.apiVersion, 'test-version');
});
test('ambiguous provider, missing deployment and malformed Azure path fail before requests', () => {
  for (const env of [
    base,
    { ...base, BLOGGER_PROVIDER: 'azure' },
    { ...base, BLOGGER_PROVIDER: 'openai', BLOGGER_MODEL: '' },
    {
      ...base,
      BLOGGER_PROVIDER: 'azure',
      OPENAI_API_BASE: 'https://example.openai.azure.com/openai/deployments/x',
      AZURE_OPENAI_API_VERSION: 'test',
    },
  ])
    assert.throws(() => getBloggerConfig(env));
});
