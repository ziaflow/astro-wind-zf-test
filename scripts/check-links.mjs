import { LinkChecker } from 'linkinator';
import path from 'path';

async function checkLinks() {
  const checker = new LinkChecker();

  console.log('🔍 Scanning for broken links in ./dist...');

  const result = await checker.check({
    path: 'dist', // Scan the build output directory
    recurse: true, // Scan subdirectories
    linksToSkip: [
      'https://www.linkedin.com/company/ziaflow', // External links that often 999/429 deny bots
      'https://www.facebook.com/ZiaFlowAZ',
      'https://www.instagram.com/ziaflowaz',
      'https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled',
      'https://maps.google.com'
    ],
    markdown: true, // check markdown files if present (optional)
  });

  const brokenLinks = result.links.filter(link => link.state === 'BROKEN');

  if (brokenLinks.length > 0) {
    console.error(`❌ Found ${brokenLinks.length} broken links:`);
    brokenLinks.forEach(link => {
      console.error(`- ${link.url} (Status: ${link.status}) on page ${link.parent}`);
    });
    process.exit(1);
  } else {
    console.log('✅ No broken links found!');
  }
}

checkLinks();
