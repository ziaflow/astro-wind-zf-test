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
        { text: 'SEO Services', href: getPermalink('/services/seo') },
        { text: 'AI Automation', href: getPermalink('/services/automation') },
        { text: 'PPC Management', href: getPermalink('/services/ppc') },
        { text: 'Web Development', href: getPermalink('/services/web-development') },
        { text: 'Ecommerce Solutions', href: getPermalink('/services/ecommerce') },
        { text: 'Cloud Solutions', href: getPermalink('/services/cloud') },
        { text: 'Software Development', href: getPermalink('/services/software') },
        { text: 'Social Media Marketing', href: getPermalink('/services/social-media') },
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
      links: [
        { text: 'Automation', href: getPermalink('/services/automation') },
        { text: 'SEO', href: getPermalink('/services/seo') },
        { text: 'PPC Management', href: getPermalink('/services/ppc') },
        { text: 'Web Development', href: getPermalink('/services/web-development') },
        { text: 'Ecommerce', href: getPermalink('/services/ecommerce') },
      ],
    },
    {
      title: 'Blog',
      links: blogLinks.length ? blogLinks : fallbackBlogLinks,
    },
    {
      title: 'ZiaFlow',
      links: [
        { text: 'ZiaFlow', href: getPermalink('/', 'home') },
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
    street: 'Phoenix, AZ 85302',
  },
  founded: 2022,
  logo: 'https://media.licdn.com/dms/image/v2/D4D3DAQGG3SQA1b-qsw/image-scale_127_750/image-scale_127_750/0/1704918615213/ziaflow_cover?e=1764907200&v=beta&t=kioeCXPAz00Lf_P4O-fWQIW6KpdIWXsdEdT7a_gWxEU',
  footNote: `
    © 2025 ZiaFlow · Founded 2022 · Phoenix, AZ 85302 · <a class="underline" href="${getPermalink('/contact')}">Contact ZiaFlow</a>
  `,
};
