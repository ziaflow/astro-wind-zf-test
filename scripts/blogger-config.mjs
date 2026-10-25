// Explicit provider selection avoids mixing Azure API-key auth with OpenAI bearer auth.
export function getBloggerConfig(env) {
  const kind = env.BLOGGER_PROVIDER;
  const apiKey = env.OPENAI_API_KEY;
  const model = env.BLOGGER_MODEL;
  if (!apiKey || !model || !['openai', 'azure'].includes(kind)) {
    throw new Error('Set BLOGGER_PROVIDER (openai or azure), BLOGGER_MODEL, and OPENAI_API_KEY.');
  }
  const options = { apiKey, maxRetries: 0, timeout: 60000 };
  const rawBase = env.OPENAI_API_BASE;
  if (rawBase) {
    const base = new URL(rawBase);
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) {
      throw new Error('Provider endpoint must be an HTTPS URL without credentials, query, or fragment.');
    }
    if (kind === 'azure') {
      if (base.pathname !== '/' || !env.AZURE_OPENAI_API_VERSION) {
        throw new Error(
          'Azure requires the resource root endpoint and AZURE_OPENAI_API_VERSION; use BLOGGER_MODEL for the deployment name.'
        );
      }
      return {
        kind,
        model,
        options: { ...options, endpoint: base.origin, apiVersion: env.AZURE_OPENAI_API_VERSION, deployment: model },
      };
    }
    return { kind, model, options: { ...options, baseURL: base.href.replace(/\/$/, '') } };
  }
  if (kind === 'azure') throw new Error('Azure requires OPENAI_API_BASE resource endpoint.');
  return { kind, model, options };
}
