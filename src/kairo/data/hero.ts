import type { Moment } from '@/interface';

export const moments: Moment[] = [
  {
    client: 'Lead Intake Audit',
    label: 'inquiries logged to database',
    value: 100,
    suffix: '%',
    image: '/images/story-halden.jpg',
    alt: 'Service technician reviewing digital dispatch workflow',
  },
  {
    client: 'Follow-Up Sprint',
    label: 'instant confirmation sent',
    value: 1,
    suffix: ' min',
    image: '/images/story-solvane.jpg',
    alt: 'Commercial team coordinating client inquiries',
  },
  {
    client: 'Lead Ownership',
    label: 'unassigned inquiries',
    value: 0,
    suffix: '',
    image: '/images/story-mirelab.jpg',
    alt: 'Operational dashboard tracking incoming requests',
  },
  {
    client: 'Pipeline Status',
    label: 'inquiry-to-booking visibility',
    value: 24,
    suffix: '/7',
    image: '/images/story-aerowin.jpg',
    alt: 'Client communication and appointment calendar',
  },
];

export const briefPortrait = {
  image: '/images/step-brief.jpg',
  alt: 'Mobile notification with lead source and contact action',
};
