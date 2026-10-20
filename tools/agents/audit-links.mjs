import fs from 'node:fs';
import path from 'node:path';

const pagesDir = 'src/pages';
const badLinks = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.astro') || entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hrefRegex = /href\s*[:=]\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = hrefRegex.exec(content)) !== null) {
        const url = match[1];
        if (url === '#' || url === '#/' || (url.startsWith('#') && !['#form', '#inquiry-form'].includes(url))) {
          badLinks.push({ file: fullPath, link: url });
        }
      }
    }
  }
}

scanDir(pagesDir);
console.log('Total dead/broken hash links found:', badLinks.length);
badLinks.forEach((b) => console.log(`${b.file} -> ${b.link}`));
