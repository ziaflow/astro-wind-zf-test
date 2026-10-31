import type { Step } from '@/interface';
import { site } from '@/data/site';

export const steps: Step[] = [
  {
    verb: 'Capture',
    tag: 'Audit & Map',
    visual: 'connect',
    title: 'Map every inquiry source into one verified record.',
    body: 'Web forms, phone tracking, Google Local Service Ads, and booking requests are connected through verified endpoints into a centralized lead database.',
    points: [
      'Form and call endpoints verified for reliable capture',
      'Timestamped database record for every accepted submission',
      'Zero lost inquiries from unmonitored inboxes or broken links',
    ],
    image: '/images/step-connect.jpg',
  },
  {
    verb: 'Assign',
    tag: 'Ownership & Alerts',
    visual: 'watch',
    title: 'Every accepted inquiry gets an owner and a next step.',
    body: 'Automated confirmation reaches the prospect immediately, while internal notifications dispatch the inquiry directly to the accountable team member.',
    points: [
      'Immediate prospect acknowledgement with expected next steps',
      'Assigned to dedicated staff by service type or territory',
      'Escalation alerts if an inquiry sits unaddressed',
    ],
    image: '/images/step-watch.jpg',
  },
  {
    verb: 'Track',
    tag: 'Status & Booking',
    visual: 'brief',
    title: 'Tracked from first touch to booked consultation.',
    body: 'Inquiries move through defined milestones — received, contacted, quoted, or booked — leaving a measurable operating process for your team.',
    points: [
      'Daily intake log with source attribution and current status',
      'Clear exception handling for unreached prospects',
      'Verified data baseline for marketing ROI and close rates',
    ],
    image: '/images/step-brief.jpg',
  },
];

export const briefPreview = {
  title: `${site.name} Intake Dispatch`,
  meta: 'Phoenix Operations, 8:15 AM',
  priority: 'High',
  text: 'New service inquiry via Google LSA. Service: Commercial Automation. Contact: (602) 834-4239. Assigned: Dispatch. Next Action: Schedule discovery call.',
  actions: { secondary: 'View lead record', primary: 'Confirm dispatch' },
};
