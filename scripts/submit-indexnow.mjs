import fs from 'fs';
import path from 'path';
import { isValidKey, submitUrls } from './indexnow.mjs';

/**
 * Script to submit URLs to IndexNow (Bing, Yandex, etc.)
 * This runs after the build process completes.
 */

const SITE_URL = 'https://ziaflow.com';
const API_KEY = process.env.INDEXNOW_KEY?.trim();
const DIST_DIR = 'dist';

function keyFileIsValid(key) {
  const keyFile = path.join(DIST_DIR, `${key}.txt`);
  if (!fs.existsSync(keyFile)) {
    console.error(`❌ Key file ${key}.txt not found in ${DIST_DIR}/. Add public/${key}.txt containing the key.`);
    return false;
  }
  // The key file must be UTF-8 and contain exactly the key.
  const contents = fs.readFileSync(keyFile, 'utf-8').replace(/^\uFEFF/, '').trim();
  if (contents !== key) {
    console.error(`❌ ${keyFile} does not contain the key. IndexNow would respond 403 Forbidden.`);
    return false;
  }
  return true;
}

async function submitToIndexNow() {
  try {
    console.log('🚀 Starting IndexNow submission...');

    if (!API_KEY) {
      console.warn('⚠️ INDEXNOW_KEY environment variable is not set. Skipping IndexNow submission.');
      return;
    }
    if (!isValidKey(API_KEY) || !keyFileIsValid(API_KEY)) {
      console.warn('⚠️ Skipping IndexNow submission.');
      return;
    }

    // 1. Find all sitemap files in the dist directory
    const files = fs.readdirSync(DIST_DIR);
    const sitemapFiles = files.filter(
      (f) => f.startsWith('sitemap-') && f.endsWith('.xml') && f !== 'sitemap-index.xml'
    );

    const allUrls = [];
    for (const file of sitemapFiles) {
      const content = fs.readFileSync(path.join(DIST_DIR, file), 'utf-8');
      for (const match of content.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)) {
        allUrls.push(match[1].replace(/&amp;/g, '&'));
      }
    }

    if (allUrls.length === 0) {
      console.warn('⚠️ No URLs found in sitemaps. Skipping IndexNow submission.');
      return;
    }
    console.log(`Found ${new Set(allUrls).size} unique URLs to submit.`);

    // 2. Submit (failures are logged, not thrown, so the build isn't broken if IndexNow is down)
    await submitUrls({ siteUrl: SITE_URL, key: API_KEY, urls: allUrls });
  } catch (error) {
    console.error('❌ Error during IndexNow submission:', error);
  }
}

submitToIndexNow();
