import type { Integration, PartnerLogo } from '@/interface';

export const customerLogos: PartnerLogo[] = [
  { name: 'Web Forms', shape: 'grid' },
  { name: 'Phone Routing', shape: 'loop' },
  { name: 'Local Service Ads', shape: 'spark' },
  { name: 'CRM Dispatch', shape: 'orbit' },
  { name: 'Database Logging', shape: 'stack' },
  { name: 'Booking Calendar', shape: 'frame' },
  { name: 'Status Pipeline', shape: 'wave' },
];

export const integrations: Integration[] = [
  { label: 'Web Forms', icon: 'credit-card' },
  { label: 'CRM Sync', icon: 'kanban' },
  { label: 'Support Desk', icon: 'lifebuoy' },
  { label: 'Lead Database', icon: 'database' },
  { label: 'Conversion Metrics', icon: 'chart' },
  { label: 'Dispatch Alerts', icon: 'chat' },
  { label: 'Phone Tracking', icon: 'phone' },
  { label: 'Email Automation', icon: 'email' },
  { label: 'Cloud Webhooks', icon: 'cloud' },
];
