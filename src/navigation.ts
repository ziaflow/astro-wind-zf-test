import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';
import { fetchPosts } from '~/utils/blog';

const latestBlogPosts = await fetchPosts();
const blogLinks = latestBlogPosts.slice(0, 5).map(({ title, permalink }) => ({
  text: title,
  href: getPermalink(permalink, 'post'),
}));

const fallbackBlogLinks = [{ text: 'All Posts', href: getBlogPermalink() }];

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/', 'home'),
    },
    {
      text: 'Services',
      href: getPermalink('/services'),
    },
    {
      text: 'About Us',
      href: getPermalink('/about'),
    },
    {
      text: 'Contact Us',
      href: getPermalink('/contact'),
    },
    {
      text: 'Blog',
      href: getBlogPermalink(),
    },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Services',
      links: [
        { text: 'SEO Audits', href: '#' },
        { text: 'Content Strategy', href: '#' },
        { text: 'Conversion Optimization', href: '#' },
        { text: 'Technical SEO', href: '#' },
        { text: 'Growth Strategy', href: '#' },
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
