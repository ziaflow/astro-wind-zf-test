import fs from 'fs';
import path from 'path';

/**
 * Script to submit URLs to IndexNow (Bing, Yandex, etc.)
 * This runs after the build process completes.
 */

const SITE_URL = 'https://ziaflow.com';
const API_KEY = 'bb34618aadae4522828704bfbb8a62aa';
const DIST_DIR = 'dist';

async function submitToIndexNow() {
  try {
    console.log('🚀 Starting IndexNow submission...');

    // 1. Find all sitemap files in the dist directory
    const files = fs.readdirSync(DIST_DIR);
    const sitemapFiles = files.filter(
      (f) => f.startsWith('sitemap-') && f.endsWith('.xml') && f !== 'sitemap-index.xml'
    );

    let allUrls = [];

    for (const file of sitemapFiles) {
      const filePath = path.join(DIST_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.matchAll(/<loc>(.*?)<\/loc>/g);
      for (const match of matches) {
        allUrls.push(match[1]);
      }
    }

    if (allUrls.length === 0) {
      console.warn('⚠️ No URLs found in sitemaps. Skipping IndexNow submission.');
      return;
    }

    // Deduplicate URLs
    const uniqueUrls = [...new Set(allUrls)];
    console.log(`Found ${uniqueUrls.length} unique URLs to submit.`);

    // 2. Prepare payload
    const payload = {
      host: new URL(SITE_URL).host,
      key: API_KEY,
      keyLocation: `${SITE_URL}/${API_KEY}.txt`,
      urlList: uniqueUrls,
    };

    // 3. Submit to IndexNow API
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ IndexNow submission successful!');
    } else {
      const errorText = await response.text();
      console.error(`❌ IndexNow submission failed with status ${response.status}: ${response.statusText}`);
      console.error('Response:', errorText);
      // We don't exit with 1 here to avoid breaking the build if the IndexNow API is down
    }
  } catch (error) {
    console.error('❌ Error during IndexNow submission:', error);
  }
}

submitToIndexNow();
