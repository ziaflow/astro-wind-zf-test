import type { NavLink } from '@/interface';

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const menuLinks: NavLink[] = [...navLinks];

export const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/services': 'Services',
  '/blog': 'Blog',
  '/about': 'About',
  '/contact': 'Contact',
};
