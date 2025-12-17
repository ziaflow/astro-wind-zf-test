import { LinkChecker } from 'linkinator';

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
      'https://maps.google.com',
      'https://ziaflow.com', // Skip self-referential absolute links during build check
      'https://ruhnueopjedaywiqhpgi.supabase.co', // Skip signed URLs that might timeout or fail auth
      'https://gmldsdtmahtgrbwwowtn.supabase.co'
    ],
    markdown: true, // check markdown files if present (optional)
  });

  const brokenLinks = result.links.filter(link => link.state === 'BROKEN');

  if (brokenLinks.length > 0) {
    const fs = await import('fs');
    const logContent = brokenLinks.map(link => `- ${link.url} (Status: ${link.status}) on page ${link.parent}`).join('\n');
    fs.writeFileSync('broken-links.log', logContent);
    
    console.error(`❌ Found ${brokenLinks.length} broken links. See broken-links.log for details.`);
    process.exit(1);
  } else {
    console.log('✅ No broken links found!');
  }
}

checkLinks();
