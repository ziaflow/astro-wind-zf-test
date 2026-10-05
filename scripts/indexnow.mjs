/**
 * Shared IndexNow helper (https://www.indexnow.org/documentation).
 */

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';
export const MAX_URLS_PER_REQUEST = 10000;

const KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;

const STATUS_MESSAGES = {
  200: 'OK - URLs submitted successfully',
  202: 'Accepted - URLs received, key validation pending',
  400: 'Bad request - invalid format',
  403: 'Forbidden - key not valid (key file not found, or key not in the file)',
  422: "Unprocessable Entity - URLs don't belong to the host or the key doesn't match the protocol schema",
  429: 'Too Many Requests - potential spam, slow down submissions',
};

export function isValidKey(key) {
  return typeof key === 'string' && KEY_PATTERN.test(key);
}

/**
 * Submit URLs to IndexNow. Never throws; returns true when every batch was accepted.
 * @param {{ siteUrl: string, key: string | undefined, urls: string[], keyLocation?: string }} options
 */
export async function submitUrls({ siteUrl, key, urls, keyLocation }) {
  if (!key) {
    console.warn('⚠️ INDEXNOW_KEY is not set. Skipping IndexNow submission.');
    return false;
  }
  if (!isValidKey(key)) {
    console.error('❌ INDEXNOW_KEY must be 8-128 characters of a-z, A-Z, 0-9 or "-". Skipping IndexNow submission.');
    return false;
  }

  const site = new URL(siteUrl);
  const host = site.host;

  const urlList = [...new Set(urls)].filter((u) => {
    try {
      return new URL(u).host === host;
    } catch {
      return false;
    }
  });
  const skipped = urls.length - urlList.length;
  if (skipped > 0) console.warn(`⚠️ Skipped ${skipped} duplicate or off-host URL(s).`);

  if (urlList.length === 0) {
    console.warn('⚠️ No URLs to submit to IndexNow.');
    return false;
  }

  const payload = {
    host,
    key,
    keyLocation: keyLocation ?? `${site.origin}/${key}.txt`,
  };

  let allOk = true;
  for (let i = 0; i < urlList.length; i += MAX_URLS_PER_REQUEST) {
    const batch = urlList.slice(i, i + MAX_URLS_PER_REQUEST);
    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ...payload, urlList: batch }),
      });
      const message = STATUS_MESSAGES[response.status] ?? response.statusText;

      if (response.status === 200 || response.status === 202) {
        console.log(`✅ IndexNow ${response.status}: ${message} (${batch.length} URL(s)).`);
      } else {
        allOk = false;
        const body = await response.text().catch(() => '');
        console.error(`❌ IndexNow ${response.status}: ${message}`);
        if (body) console.error('Response:', body);
        if (response.status === 429) break;
      }
    } catch (error) {
      allOk = false;
      console.error('❌ IndexNow request failed:', error);
    }
  }

  return allOk;
}
