import type { NavLink } from '@/interface';

export const navLinks: NavLink[] = [
  { label: 'Home', href: 'https://ziaflow.com/' },
  { label: 'Services', href: 'https://ziaflow.com/services' },
  { label: 'Blog', href: 'https://ziaflow.com/blog' },
  { label: 'About', href: 'https://ziaflow.com/about' },
  { label: 'Contact', href: 'https://ziaflow.com/contact' },
];

export const menuLinks: NavLink[] = [...navLinks];

export const routeLabels: Record<string, string> = {
  '/': 'Home',
  'https://ziaflow.com/': 'Home',
  'https://ziaflow.com/services': 'Services',
  'https://ziaflow.com/blog': 'Blog',
  'https://ziaflow.com/about': 'About',
  'https://ziaflow.com/contact': 'Contact',
};
