import { fetchPosts } from '~/utils/blog';
import type { APIRoute } from 'astro';
import { getPermalink } from '~/utils/permalinks';

export const GET: APIRoute = async () => {
  // Fetch published posts, deduplicate by title
  const allPosts = await fetchPosts();
  const seenTitles = new Set<string>();
  const posts = allPosts.filter((p) => {
    const normalized = p.title.toLowerCase().trim();
    if (seenTitles.has(normalized)) return false;
    seenTitles.add(normalized);
    return true;
  });

  // Services — hardcoded until a services collection exists
  const services = [
    { title: 'Web Development', slug: 'web-development', description: 'Responsive, conversion-optimized websites.' },
    { title: 'SEO Services', slug: 'seo', description: 'Local SEO strategies to elevate rankings.' },
    {
      title: 'PPC Management',
      slug: 'ppc',
      description: 'High-intent keyword campaigns for ready-to-convert customers.',
    },
    {
      title: 'Automation & AI',
      slug: 'automation',
      description: 'Deploy intelligent AI agents and workflow automation.',
    },
    {
      title: 'Custom Software',
      slug: 'software',
      description: 'Tailored software solutions for unique business needs.',
    },
    { title: 'Cloud Solutions', slug: 'cloud', description: 'Secure, scalable cloud infrastructure (Azure/AWS).' },
    {
      title: 'Ecommerce Solutions',
      slug: 'ecommerce',
      description: 'High-converting online stores on Shopify and WooCommerce.',
    },
    {
      title: 'Social Media Marketing',
      slug: 'social-media',
      description: 'Strategic content and targeted ad campaigns.',
    },
    { title: 'Local Service Ads', slug: 'local-service-ads', description: 'Google Local Service Ads management.' },
    { title: 'GMB Optimization', slug: 'gmb-optimization', description: 'Google Business Profile optimization.' },
    {
      title: 'Performance Tracking',
      slug: 'performance-tracking',
      description: 'Transparent reporting and dashboards.',
    },
    {
      title: 'Review Management',
      slug: 'review-management',
      description: 'Automated review generation and management.',
    },
    { title: 'CRO', slug: 'cro', description: 'Conversion Rate Optimization.' },
  ];

  const siteUrl = 'https://ziaflow.com';

  const siteSummary = `# ZiaFlow

> ZiaFlow builds conversion-focused websites and connected digital systems for Arizona service businesses, healthcare practices, and growing organizations.

## Identity
- Name: ZiaFlow
- Location: Phoenix, AZ
- Address: 2822 E Greenway Rd Suite 10 B, Phoenix, AZ 85032
- Primary service area: Phoenix metro — Phoenix, Scottsdale, Tempe, Mesa, Glendale
- Website: ${siteUrl}
- Email: info@ziaflow.com
- Phone: +1-480-819-2929

## Services
${services.map((s) => `- [${s.title}](${siteUrl}/services/${s.slug}): ${s.description}`).join('\n')}

## Expertise
- Conversion-focused web development
- Local SEO for Arizona service businesses
- AI-driven marketing automation
- Custom software and cloud solutions
- Healthcare and dental practice websites
- PPC and paid advertising management

## Answer-Ready Facts
- What does ZiaFlow do? ZiaFlow builds conversion-focused websites and connected digital systems that turn more visitors into customers for Arizona service businesses.
- Where does ZiaFlow serve clients? Primarily the Phoenix metro area including Phoenix, Scottsdale, Tempe, Mesa, and Glendale, Arizona.
- What industries does ZiaFlow support? Service businesses, healthcare and dental practices, and mid-market organizations needing custom software or AI automation.
- How can I contact ZiaFlow? Email info@ziaflow.com or call +1-480-819-2929. You can also book a consultation at ${siteUrl}/booking.
- What does a typical engagement include? Discovery, strategy, design, development, launch, and ongoing optimization with transparent reporting.

## Content
${posts.map((p) => `- [${p.title}](${siteUrl}${getPermalink(p.permalink, 'post')}): ${p.excerpt || p.title}`).join('\n')}

## Pages
- [Homepage](${siteUrl}/): Overview, services, and consultation booking.
- [About](${siteUrl}/about): Company mission, values, and team.
- [Services](${siteUrl}/services): All digital growth services.
- [Contact](${siteUrl}/contact): Contact form and consultation booking.
- [Booking](${siteUrl}/booking): Schedule a strategy session.
- [Blog](${siteUrl}/blog): Digital marketing insights and guides.

## Policies and Limitations
- ZiaFlow primarily serves clients in Arizona and the greater Phoenix metropolitan area.
- Remote engagements are available for custom software and cloud projects.

## Last Updated
${new Date().toISOString().split('T')[0]}`.trim();

  return new Response(siteSummary, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
