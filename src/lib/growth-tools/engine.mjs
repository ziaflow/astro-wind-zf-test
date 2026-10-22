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
        'Compare c…2749 tokens truncated…te,
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
