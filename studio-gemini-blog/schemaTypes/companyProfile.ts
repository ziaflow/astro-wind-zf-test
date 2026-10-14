import {defineField, defineType} from 'sanity'

export const companyProfileType = defineType({
  name: 'companyProfile',
  title: 'Company Profile (Source of Truth)',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'businessName',
      title: 'Official Business Name',
      type: 'string',
      validation: (rule) => rule.required(),
      initialValue: 'ZiaFlow',
    }),
    defineField({
      name: 'tagline',
      title: 'Positioning Tagline',
      type: 'string',
      description: 'Grounded commercial positioning, e.g. "Conversion-Focused Web Engineering & Automation Systems for Arizona Service Businesses"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryContactEmail',
      title: 'Public Contact Email',
      type: 'string',
      validation: (rule) => rule.email(),
      initialValue: 'admin@ziaflow.com',
    }),
    defineField({
      name: 'consultationBookingUrl',
      title: 'Consultation Booking URL',
      type: 'url',
      initialValue: 'https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled',
    }),
    defineField({
      name: 'locationPolicy',
      title: 'Location & Public Address Policy',
      type: 'object',
      fields: [
        defineField({
          name: 'displayPhysicalAddress',
          title: 'Display Physical Address Publicly',
          type: 'boolean',
          description: 'If false, public pages show service areas instead of physical office address.',
          initialValue: false,
        }),
        defineField({
          name: 'serviceAreas',
          title: 'Primary Service Areas',
          type: 'array',
          of: [{type: 'string'}],
          initialValue: ['Phoenix', 'Scottsdale', 'Paradise Valley', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Tucson'],
        }),
        defineField({
          name: 'state',
          title: 'State / Region',
          type: 'string',
          initialValue: 'Arizona',
        }),
        defineField({
          name: 'operationalZip',
          title: 'Operational ZIP Code',
          type: 'string',
          description: 'Internal reference ZIP code (e.g., 85023)',
          initialValue: '85023',
        }),
      ],
    }),
    defineField({
      name: 'approvedServices',
      title: 'Approved Core Services (Commercial Anchors)',
      type: 'array',
      of: [{type: 'string'}],
      initialValue: [
        'Conversion-Focused Web Development (Astro)',
        'Workflow & Intake Automation (Microsoft 365 / Supabase)',
        'Search Engine Optimization & AI Citation Strategy',
        'PPC Management & Paid Search Advertising',
      ],
    }),
    defineField({
      name: 'publishingGovernance',
      title: 'Publishing Governance & Evidence Standards',
      type: 'object',
      fields: [
        defineField({
          name: 'requireEvidenceForClaims',
          title: 'Require Evidence for Claims',
          type: 'boolean',
          initialValue: true,
          description: 'Disallows unsubstantiated claims (e.g. "leading agency", "guaranteed #1")',
        }),
        defineField({
          name: 'allowConfidentialProposalReuse',
          title: 'Allow Confidential Proposal Reuse',
          type: 'boolean',
          initialValue: false,
          readOnly: true,
          description: 'Strict policy: Proposals and NDA documents cannot be ingested or published as case studies.',
        }),
        defineField({
          name: 'lastAuditDate',
          title: 'Last Profile Audit Date',
          type: 'datetime',
          initialValue: () => new Date().toISOString(),
        }),
      ],
    }),
  ],
})
