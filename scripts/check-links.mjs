import fs from 'node:fs';
import { LinkChecker } from 'linkinator';

// 1. Target dist/client when using @astrojs/vercel
const DIST_DIR = fs.existsSync('./dist/client') ? './dist/client' : './dist';

// 2. Ignore serverless / dynamic form paths and external bots blockers
const linksToSkip = [
  'https://www.linkedin.com/company/ziaflow',
  'https://www.facebook.com/ZiaFlowAZ',
  'https://www.instagram.com/ziaflowaz',
  'https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled',
  'https://maps.google.com',
  'https://ziaflow.com',
  'https://ruhnueopjedaywiqhpgi.supabase.co',
  'https://gmldsdtmahtgrbwwowtn.supabase.co',
  '/forms/submit',
  '/api/forms/audit',
  '/api/contact',
  '/_actions',
  /\/forms\/submit/,
  /\/api\/forms\/audit/,
  /\/api\/contact/,
  /\/_actions/,
];

async function checkLinks() {
  const checker = new LinkChecker();

  console.log(`🔍 Scanning for broken links in ${DIST_DIR}...`);

  const result = await checker.check({
    path: DIST_DIR,
    recurse: true,
    linksToSkip,
    markdown: true,
  });

  const brokenLinks = result.links.filter((link) => link.state === 'BROKEN');

  if (brokenLinks.length > 0) {
    const logContent = brokenLinks
      .map((link) => `- ${link.url} (Status: ${link.status}) on page ${link.parent}`)
      .join('\n');
    fs.writeFileSync('broken-links.log', logContent);

    console.error(`❌ Found ${brokenLinks.length} broken links. Check broken-links.log for details.`);
    process.exit(1);
  } else {
    console.log('✅ No broken links found!');
  }
}

checkLinks();
