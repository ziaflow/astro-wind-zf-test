import type { NavLink } from '@/interface';

export const navLinks: NavLink[] = [
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const menuLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Free Audit', href: '/audit' },
  { label: 'Tools', href: '/growth-tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/services': 'Services',
  '/growth-tools': 'Tools',
  '/pricing': 'Pricing',
  '/case-studies': 'Case Studies',
  '/audit': 'Free Audit',
  '/blog': 'Blog',
  '/about': 'About',
  '/contact': 'Contact',
};
