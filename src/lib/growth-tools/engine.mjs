// Versioned, self-reported assessments. No ranking or revenue guarantees.
export const VERSION = '2026-10-21.1';
export const tools = [
  {
    slug: 'website-project-estimator',
    title: 'Website project estimator',
    service: 'Website design and development',
    intro: 'Turn your goals into an indicative scope, budget, and delivery window.',
    cta: 'Request a website scope review',
    kind: 'estimate',
    questions: [],
  },
  {
    slug: 'lead-follow-up-assessment',
    title: 'Lead follow-up assessment',
    service: 'CRM and nurture implementation',
    intro: 'Find where inquiries lose momentum between first contact and a sale.',
    cta: 'Request a lead workflow review',
    kind: 'assessment',
    questions: [
      [
        'capture',
        'Every inquiry lands in one CRM or shared inbox',
        3,
        1,
        'Route all inquiry channels into a single intake queue.',
        'Submit a test inquiry through each channel and confirm arrival.',
      ],
      [
        'owner',
        'Every new lead has an owner and a next action',
        3,
        1,
        'Assign an owner and next action when an inquiry arrives.',
        'Inspect five recent inquiries for an owner and due date.',
      ],
      [
        'response',
        'You measure time to the first useful human response',
        3,
        1,
        'Record response timestamps and define a realistic service target.',
        'Compare received and reply timestamps; auto receipts do not count.',
      ],
      [
        'afterhours',
        'After-hours inquiries receive clear expectations',
        2,
        1,
        'Confirm receipt and explain when a person will respond.',
        'Test your form outside business hours.',
      ],
      [
        'nurture',
        'Unanswered inquiries receive relevant follow-up',
        3,
        2,
        'Draft a short follow-up sequence with clear stop rules.',
        'Inspect follow-up history for five unanswered inquiries.',
      ],
      [
        'consent',
        'Marketing consent and unsubscribe preferences are respected',
        3,
        2,
        'Separate requested replies from marketing subscription preferences.',
        'Check the form wording and unsubscribe behavior.',
      ],
      [
        'booking',
        'Prospects can book and reschedule without repeated emails',
        2,
        2,
        'Connect a tested booking flow with confirmation and reminders.',
        'Complete a test booking, reschedule, and cancellation.',
      ],
      [
        'pipeline',
        'Your pipeline records booked, qualified, proposed, and won stages',
        2,
        2,
        'Define stages and record why opportunities stall.',
        'Review recent inquiries through their final outcome.',
      ],
      [
        'stops',
        'Nurture stops after replies, meetings, opt-outs, or a sale',
        3,
        2,
        'Add suppression and exit rules before activating follow-up.',
        'Test each exit event using internal profiles.',
      ],
      [
        'measurement',
        'You measure inquiry-to-meeting and meeting-to-sale rates',
        2,
        2,
        'Track stage changes and review a consistent monthly cohort.',
        'Count qualified inquiries, attended meetings, and wins.',
      ],
    ],
  },
  {
    slug: 'software-stack-assessment',
    title: 'Software stack assessment',
    service: 'Integration and automation consulting',
    intro: 'Identify overlapping subscriptions, repeated data entry, and fragile handoffs.',
    cta: 'Request an integration map',
    kind: 'stack',
    questions: [
      [
        'inventory',
        'You have an inventory of tools, owners, costs, and renewal dates',
        2,
        1,
        'Create a tool inventory before purchasing or removing software.',
        'Compare card statements and account owners.',
      ],
      [
        'source',
        'Core customer data has one agreed source of truth',
        3,
        2,
        'Choose the authoritative system and define sync direction.',
        'Trace one customer across your CRM, billing, and email tools.',
      ],
      [
        'duplicates',
        'Duplicate capabilities are reviewed before renewals',
        2,
        1,
        'Review overlapping functions and usage before cancellation.',
        'Compare enabled features, actual usage, and contract terms.',
      ],
      [
        'handoffs',
        'Important handoffs avoid manual copy and paste',
        3,
        2,
        'Map a single high-volume handoff for a small integration pilot.',
        'Follow an inquiry from intake to invoice and count re-entry.',
      ],
      [
        'monitoring',
        'Failed integrations alert an accountable person',
        3,
        2,
        'Add failure alerts, retries, and a manual recovery procedure.',
        'Trigger a safe test failure and confirm the alert.',
      ],
      [
        'identity',
        'Staff use individual accounts and appropriate permissions',
        3,
        2,
        'Remove shared logins and review access during offboarding.',
        'Inspect account roles and your offboarding checklist.',
      ],
      [
        'export',
        'Critical data can be exported and restored',
        3,
        2,
        'Test exports and document a recovery procedure.',
        'Restore a small sample into a safe test location.',
      ],
      [
        'costs',
        'Automation decisions include maintenance and exception handling',
        2,
        2,
        'Include software, support, and human review in the business case.',
        'Compare estimated effort with the last three months of incidents.',
      ],
    ],
  },
  {
    slug: 'local-visibility-check',
    title: 'Local visibility check',
    service: 'Local SEO',
    intro: 'Review the business information and local proof customers rely on.',
    cta: 'Request a local visibility review',
    kind: 'local',
    questions: [
      [
        'profile',
        'You manage a verified Google Business Profile, if eligible',
        3,
        2,
        'Confirm eligibility and ownership; do not create an ineligible location.',
        'Open Google Business Profile and inspect verification status.',
      ],
      [
        'category',
        'Your primary category describes the core business accurately',
        3,
        1,
        'Review your primary category against the actual core service.',
        'Compare the profile category with your main offering.',
      ],
      [
        'details',
        'Name, contact details, hours, and website are accurate',
        3,
        1,
        'Correct public details and special hours.',
        'Compare your website, Google profile, and major directories.',
      ],
      [
        'servicearea',
        'Address visibility or service area matches how you operate',
        2,
        1,
        'Review location and service-area settings for accuracy.',
        'Do not publish a home address solely to pass a checklist.',
      ],
      [
        'reviews',
        'You request honest reviews without incentives or review gating',
        3,
        2,
        'Create a consistent, neutral review request process.',
        'Check the language and who receives review requests.',
      ],
      [
        'responses',
        'Recent reviews receive useful, professional responses',
        2,
        1,
        'Assign review monitoring and response ownership.',
        'Read your most recent reviews and replies.',
      ],
      [
        'pages',
        'Your site explains genuine services and locations served',
        2,
        2,
        'Improve useful service and location information without doorway pages.',
        'Look for accurate examples, coverage, and contact information.',
      ],
      [
        'tracking',
        'Calls, directions, and website inquiries are measured',
        2,
        2,
        'Set up reliable local conversion measurement.',
        'Check Business Profile performance and inquiry source records.',
      ],
    ],
  },
  {
    slug: 'website-conversion-checklist',
    title: 'Website conversion checklist',
    service: 'Conversion and UX improvements',
    intro: "Review the path from a visitor's first impression to a useful inquiry.",
    cta: 'Request a conversion review',
    kind: 'assessment',
    questions: [
      [
        'message',
        'The first screen explains who you help and the outcome',
        3,
        1,
        'Rewrite the opening message around audience, service, and benefit.',
        'Ask someone unfamiliar with the business to describe it.',
      ],
      [
        'action',
        'Each key page has a clear primary next step',
        3,
        1,
        'Give each page one clear primary call to action.',
        'Inspect your main service page on a phone.',
      ],
      [
        'proof',
        'Claims have relevant, permissioned customer proof',
        3,
        2,
        'Add specific examples, approved testimonials, or case studies.',
        'Match each major claim to evidence you can substantiate.',
      ],
      [
        'forms',
        'Forms ask only for information needed at this stage',
        3,
        1,
        'Remove unnecessary required fields and explain what happens next.',
        'Complete your form using a phone.',
      ],
      [
        'errors',
        'Fields have visible labels and helpful error messages',
        3,
        2,
        'Add visible labels, keyboard access, and actionable errors.',
        'Try keyboard-only completion and invalid inputs.',
      ],
      [
        'delivery',
        'Test submissions reach the intended person reliably',
        3,
        2,
        'Verify database persistence and notification delivery.',
        'Submit a marked test inquiry and follow it end to end.',
      ],
      [
        'mobile',
        'Text, navigation, and buttons work comfortably on mobile',
        2,
        2,
        'Fix the most disruptive mobile interaction first.',
        'Check a narrow screen, zoom, menus, and tap targets.',
      ],
      [
        'speed',
        'You assess loading and interaction using measured data',
        2,
        2,
        'Review real-user performance and prioritize the largest bottleneck.',
        'Use Search Console or PageSpeed Insights; do not infer speed from appearance.',
      ],
      [
        'expectations',
        'Visitors understand scope, pricing approach, and response expectations',
        2,
        1,
        'Explain the buying process and what happens after inquiry.',
        'Read the service and contact pages as a new prospect.',
      ],
      [
        'funnel',
        'You track starts, submissions, qualified inquiries, and meetings',
        2,
        2,
        'Measure the complete inquiry funnel before claiming conversion gains.',
        'Compare form events with actual received inquiries.',
      ],
    ],
  },
];
export function getTool(slug) {
  return tools.find((t) => t.slug === slug);
}
export function assess(slug, answers = {}) {
  const tool = getTool(slug);
  if (!tool || tool.kind === 'estimate') throw new Error('Invalid assessment');
  let earned = 0,
    possible = 0,
    answered = 0,
    assessed = 0;
  const gaps = [],
    unknown = [];
  for (const [id, label, weight, effort, fix, evidence] of tool.questions) {
    const value = answers[id];
    if (value === undefined || value === '') {
      unknown.push({ id, label, evidence });
      continue;
    }
    if (!['yes', 'partly', 'no', 'unknown', 'na'].includes(value)) throw new Error('Invalid answer');
    answered++;
    if (value === 'unknown') {
      unknown.push({ id, label, evidence });
      continue;
    }
    if (value === 'na') continue;
    assessed++;
    const fraction = value === 'yes' ? 1 : value === 'partly' ? 0.5 : 0;
    earned += weight * fraction;
    possible += weight;
    if (fraction < 1) gaps.push({ id, label, fix, evidence, priority: (weight * (1 - fraction)) / effort });
  }
  gaps.sort((a, b) => b.priority - a.priority);
  return {
    version: VERSION,
    tool: slug,
    evidenceStatus: 'self_reported',
    score: possible ? Math.round((100 * earned) / possible) : null,
    answered,
    total: tool.questions.length,
    assessed,
    coverage: Math.round((100 * assessed) / tool.questions.length),
    complete: answered === tool.questions.length,
    priorities: gaps.slice(0, 3),
    unknown,
  };
}
export const estimateDefaults = {
  pages: 5,
  integrations: 0,
  languages: 1,
  content: 'ready',
  commerce: false,
  migration: false,
  rate: 100,
};
export function estimate(input) {
  const x = { ...estimateDefaults, ...input };
  for (const [key, min, max] of [
    ['pages', 1, 100],
    ['integrations', 0, 20],
    ['languages', 1, 10],
    ['rate', 25, 300],
  ]) {
    if (typeof x[key] !== 'number' || !Number.isFinite(x[key]) || x[key] < min || x[key] > max)
      throw new Error('Invalid ' + key);
    if (key !== 'rate' && !Number.isInteger(x[key])) throw new Error('Use whole numbers for ' + key);
  }
  if (
    !['ready', 'editing', 'writing'].includes(x.content) ||
    typeof x.commerce !== 'boolean' ||
    typeof x.migration !== 'boolean'
  )
    throw new Error('Invalid options');
  const breakdown = [
    { label: 'Discovery, information architecture, and project coordination', hours: 16 },
    { label: 'Design system and responsive foundations', hours: 20 },
    { label: 'Page implementation', hours: x.pages * 4 },
    { label: 'Integration configuration', hours: x.integrations * 10 },
    { label: 'Additional language implementation', hours: (x.languages - 1) * x.pages * 1.5 },
    { label: 'Content support', hours: x.pages * { ready: 0, editing: 1.5, writing: 3 }[x.content] },
    { label: 'Commerce setup allowance', hours: x.commerce ? 24 : 0 },
    { label: 'Migration and redirect allowance', hours: x.migration ? 12 : 0 },
  ];
  const base = breakdown.reduce((n, r) => n + r.hours, 0);
  breakdown.push({ label: 'Quality assurance and launch', hours: Math.ceil(base * 0.2) });
  const hours = breakdown.reduce((n, r) => n + r.hours, 0);
  const low = Math.round(hours * x.rate),
    high = Math.round(low * 1.35);
  return {
    version: VERSION,
    tool: 'website-project-estimator',
    currency: 'USD',
    hours,
    low,
    high,
    weeksLow: Math.ceil(hours / 25),
    weeksHigh: Math.ceil(hours / 20) + 2,
    rate: x.rate,
    breakdown,
    exclusions: [
      'Hosting, subscriptions, taxes, advertising, legal review, custom applications, and ongoing maintenance.',
      'Timeline assumes timely feedback and content. Complex integrations require separate discovery.',
    ],
    disclaimer:
      'Illustrative planning model with an editable hourly assumption; not an approved ZiaFlow rate card, quote, or commitment.',
  };
}
export function stackSummary(rows = []) {
  if (!Array.isArray(rows) || rows.length > 20) throw new Error('Maximum 20 tools');
  const groups = new Map();
  let monthlyCost = 0,
    manualHours = 0;
  for (const row of rows) {
    if (
      !row ||
      typeof row.name !== 'string' ||
      row.name.length > 100 ||
      typeof row.function !== 'string' ||
      row.function.length > 80
    )
      throw new Error('Invalid tool row');
    if (
      !Number.isFinite(row.cost) ||
      row.cost < 0 ||
      row.cost > 100000 ||
      !Number.isFinite(row.hours) ||
      row.hours < 0 ||
      row.hours > 168
    )
      throw new Error('Invalid tool cost or hours');
    monthlyCost += row.cost;
    manualHours += row.hours;
    const key = row.function.trim().toLowerCase();
    if (key) groups.set(key, [...(groups.get(key) || []), row.name]);
  }
  return {
    monthlyCost,
    manualHoursPerWeek: manualHours,
    overlapCandidates: [...groups]
      .filter(([, names]) => names.length > 1)
      .map(([purpose, names]) => ({ purpose, names })),
    note: 'Shared purpose flags a review candidate, not a cancellation recommendation. Hours are summed as entered; avoid counting the same task twice.',
  };
}
