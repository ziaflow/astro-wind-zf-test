import type { APIRoute } from 'astro';
import { fetchPosts } from '~/utils/blog';
import { getPermalink } from '~/utils/permalinks';

export const GET: APIRoute = async () => {
  const posts = await fetchPosts();

  // Note: Services are currently hardcoded as there is no 'services' collection yet.
  const services = [
    {
      data: { title: 'Automation & AI', description: 'Deploy intelligent AI agents and workflow automation.' },
      slug: 'automation',
    },
    {
      data: { title: 'Social Media Marketing', description: 'Strategic content and targeted ad campaigns.' },
      slug: 'social-media',
    },
    {
      data: { title: 'Ecommerce Solutions', description: 'High-converting online stores on Shopify and WooCommerce.' },
      slug: 'ecommerce',
    },
    {
      data: { title: 'Cloud Solutions', description: 'Secure, scalable cloud infrastructure (Azure/AWS).' },
      slug: 'cloud',
    },
    {
      data: { title: 'Web Development', description: 'Responsive, conversion-optimized websites.' },
      slug: 'web-development',
    },
    { data: { title: 'SEO Services', description: 'Local SEO strategies to elevate rankings.' }, slug: 'seo' },
    {
      data: { title: 'PPC Management', description: 'High-intent keyword campaigns for ready-to-convert customers.' },
      slug: 'ppc',
    },
    {
      data: { title: 'Custom Software', description: 'Tailored software solutions for unique business needs.' },
      slug: 'software',
    },
    {
      data: { title: 'Local Service Ads', description: 'Google Local Service Ads management.' },
      slug: 'local-service-ads',
    },
    {
      data: { title: 'Performance Tracking', description: 'Transparent reporting and dashboards.' },
      slug: 'performance-tracking',
    },
    {
      data: { title: 'GMB Optimization', description: 'Google Business Profile optimization.' },
      slug: 'gmb-optimization',
    },
    {
      data: { title: 'Review Management', description: 'Automated review generation and management.' },
      slug: 'review-management',
    },
    { data: { title: 'CRO', description: 'Conversion Rate Optimization.' }, slug: 'cro' },
  ];

  // 2. Define your Site Summary (The "Resume" for AI)
  const siteSummary = `
# ZiaFlow - Phoenix Web Development & SEO
> ZiaFlow is a conversion-first digital agency in Phoenix, AZ, specializing in high-performance web development, Local SEO, and AI-driven marketing automation for Arizona service businesses.

## Core Services
${services.map((s) => `- [${s.data.title}](https://ziaflow.com/services/${s.slug}): ${s.data.description}`).join('\n')}

## Expertise & Guides (Topic Clusters)
${posts.map((p) => `- [${p.title}](https://ziaflow.com${getPermalink(p.permalink, 'post')}): ${p.excerpt || p.title}`).join('\n')}

## Contact & Location
- Address: 2822 E Greenway Rd Suite 10 B, Phoenix, AZ 85032
- Phone: +1-480-819-2929
- Email: info@ziaflow.com
  `.trim();

  // 3. Return the response as plain text (Required MIME type for LLMs)
  return new Response(siteSummary, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
};
