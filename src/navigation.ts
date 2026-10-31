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
      text: 'Pricing',
      href: getPermalink('/pricing'),
    },
    {
      text: 'Free Audit',
      href: getPermalink('/audit'),
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
      text: '📞 (602) 834-4239',
      href: 'tel:+16028344239',
      variant: 'primary' as const,
    },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Services',
      links: [
        { text: 'AI & Automation', href: getPermalink('/services/automation') },
        { text: 'Web Development', href: getPermalink('/services/web-development') },
        { text: 'SEO', href: getPermalink('/services/seo') },
        { text: 'PPC Management', href: getPermalink('/services/ppc') },
        { text: 'Ecommerce', href: getPermalink('/services/ecommerce') },
      ],
    },
    {
      title: 'Blog',
      links: blogLinks.length ? blogLinks : fallbackBlogLinks,
    },
    {
      title: 'Company',
      links: [
        { text: 'Home', href: getPermalink('/') },
        { text: 'About ZiaFlow', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
    { text: 'Terms', href: getPermalink('/terms') },
  ],
  socialLinks: [
    {
      text: 'LinkedIn',
      ariaLabel: 'LinkedIn',
      icon: 'tabler:brand-linkedin',
      href: 'https://www.linkedin.com/company/ziaflow/',
    },
    {
      text: 'Instagram',
      ariaLabel: 'Instagram',
      icon: 'tabler:brand-instagram',
      href: 'https://www.instagram.com/ziaflowaz/',
    },
    {
      text: 'Facebook',
      ariaLabel: 'Facebook',
      icon: 'tabler:brand-facebook',
      href: 'https://www.facebook.com/ZiaFlowAZ/',
    },
    {
      text: 'Google',
      ariaLabel: 'Google',
      icon: 'tabler:brand-google',
      href: 'https://share.google/BE2Y4QPhcqrfZdnvi',
    },
    {
      text: 'Yelp',
      ariaLabel: 'Yelp',
      href: 'https://www.yelp.com/biz/ziaflow-phoenix',
      svg: '<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><path d="M12.062 13.064l2.766 6.326c.205.47.818.57 1.164.19l3.056-3.348c.348-.381.258-1-.168-1.182l-6.242-2.67c-.378-.162-.77.24-.576.684zm-2.036-.595L3.385 10.74c-.488-.158-.65-.754-.31-1.135l2.996-3.402c.342-.387.954-.343 1.165.112l2.756 5.946c.176.438-.172.888-.636.757l-.33-.049zm1.096-2.52L12.59.882c.118-.5-.306-.975-.82-.924L7.33.42c-.512.05-.858.552-.667 1.026l2.455 6.082c.18.444.757.51 1.026.126l.448-.705zm.96 4.093l5.58-1.583c.504-.143.738-.724.444-1.155l-2.59-3.79c-.294-.43-.91-.444-1.173-.027l-3.376 5.342c-.247.391.037.892.483.766l.632-.153zm-1.898 1.488l-4.52 4.41c-.372.363-.332.98.077 1.259l3.606 2.455c.408.278.966.088 1.062-.395l1.233-6.195c.092-.46-.388-.813-.79-.536l-.668.507z"/></svg>',
    },
    { text: 'RSS', ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  address: {
    street: 'Phoenix, AZ 85302',
  },
  founded: 2022,
  logo: 'https://media.licdn.com/dms/image/v2/D4D3DAQGG3SQA1b-qsw/image-scale_127_750/image-scale_127_750/0/1704918615213/ziaflow_cover?e=1764907200&v=beta&t=kioeCXPAz00Lf_P4O-fWQIW6KpdIWXsdEdT7a_gWxEU',
  footNote: `
    © ${new Date().getFullYear()} ZiaFlow · Founded 2022 · Phoenix, AZ 85302 · <a class="underline hover:text-white" href="tel:+16028344239">📞 (602) 834-4239</a> · <a class="underline hover:text-white" href="${getPermalink('/contact')}">Contact ZiaFlow</a>
  `,
};
