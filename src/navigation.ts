import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';
import { fetchPosts } from '~/utils/blog';

const truncateWords = (text: string, limit = 8) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return `${words.slice(0, limit).join(' ')}…`;
};

const latestBlogPosts = await fetchPosts();
const blogLinks = latestBlogPosts.slice(0, 5).map(({ title, permalink }) => ({
  text: truncateWords(title),
  href: getPermalink(permalink, 'post'),
}));

const fallbackBlogLinks = [{ text: 'All Posts', href: getBlogPermalink() }];

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
    },
    {
      text: 'Services',
      links: [
        { text: 'Astro Web Development', href: getPermalink('/services/astro') },
        { text: 'Custom Web Engineering', href: getPermalink('/services/web-development') },
        { text: 'React & Next.js Apps', href: getPermalink('/services/react') },
        { text: 'Shopify Storefronts', href: getPermalink('/services/shopify') },
        { text: 'WordPress Solutions', href: getPermalink('/services/wordpress') },
        { text: 'Wix Optimization & Migration', href: getPermalink('/services/wix') },
        { text: 'AI Automation', href: getPermalink('/services/automation') },
        { text: 'SEO Services', href: getPermalink('/services/seo') },
        { text: 'PPC Management', href: getPermalink('/services/ppc') },
      ],
    },
    {
      text: 'Blog',
      links: [{ text: 'All Articles', href: getBlogPermalink() }, ...blogLinks],
    },
    {
      text: 'About',
      href: getPermalink('/about'),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
  actions: [
    {
      text: 'Book Consultation',
      href: 'https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled',
      variant: 'primary' as const,
    },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Services',
      href: getPermalink('/services'),
      links: [
        { text: 'Astro Development', href: getPermalink('/services/astro') },
        { text: 'Custom Web Engineering', href: getPermalink('/services/web-development') },
        { text: 'React & Next.js', href: getPermalink('/services/react') },
        { text: 'Shopify Storefronts', href: getPermalink('/services/shopify') },
        { text: 'WordPress Solutions', href: getPermalink('/services/wordpress') },
        { text: 'Wix Optimization', href: getPermalink('/services/wix') },
        { text: 'AI Automation', href: getPermalink('/services/automation') },
      ],
    },
    {
      title: 'Blog',
      href: getBlogPermalink(),
      links: [
        { text: 'View All Articles →', href: getBlogPermalink() },
        ...(blogLinks.length ? blogLinks : fallbackBlogLinks),
      ],
    },
    {
      title: 'ZiaFlow',
      href: getPermalink('/', 'home'),
      links: [
        { text: 'Home', href: getPermalink('/', 'home') },
        { text: 'About', href: getPermalink('/about') },
        { text: 'Contact ZiaFlow', href: getPermalink('/contact') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Google', icon: 'tabler:brand-google', href: 'https://share.google/BE2Y4QPhcqrfZdnvi' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/company/ziaflow/' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/ziaflowaz/' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/ZiaFlowAZ/' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  address: {
    street: 'Phoenix, AZ 85023',
  },
  founded: 2022,
  logo: 'https://media.licdn.com/dms/image/v2/D4D3DAQGG3SQA1b-qsw/image-scale_127_750/image-scale_127_750/0/1704918615213/ziaflow_cover?e=1764907200&v=beta&t=kioeCXPAz00Lf_P4O-fWQIW6KpdIWXsdEdT7a_gWxEU',
  footNote: `
    © ${new Date().getFullYear()} ZiaFlow · Founded 2022 · Phoenix, AZ 85023 · <a class="underline" href="mailto:info@ziaflow.com">info@ziaflow.com</a> · <a class="underline" href="${getPermalink('/contact')}">Contact ZiaFlow</a>
  `,
};
