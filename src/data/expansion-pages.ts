export interface ExpansionSection {
  heading: string;
  body: string;
  items: string[];
}
export interface ExpansionPage {
  kind: 'service' | 'industry' | 'location';
  slug: string;
  path: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: ExpansionSection[];
  faqs: { question: string; answer: string }[];
  related: { label: string; href: string }[];
}

export const expansionPages: ExpansionPage[] = [
  {
    kind: 'service',
    slug: 'technical-seo',
    path: '/services/technical-seo',
    title: 'Technical SEO for Arizona Businesses | ZiaFlow',
    description:
      'Find crawl, indexing, canonical, redirect, and performance issues on your Arizona business website. Get prioritized fixes with implementation evidence.',
    heading: 'Technical SEO. Clear priorities.',
    intro:
      'A website can look finished while search engines encounter missing pages, conflicting canonicals, or navigation that hides its most useful content. We investigate those technical barriers before recommending more pages.',
    sections: [
      {
        heading: 'Start with the URLs you already own',
        body: 'The first deliverable is a working URL inventory, not a generic health score. We compare live responses, sitemap entries, internal links, and Search Console evidence to identify where visitors or crawlers lose their path.',
        items: [
          'Trace redirects to a relevant final destination and remove avoidable hops.',
          'Check canonical URLs, indexability, robots rules, and sitemap inclusion together.',
          'Separate deliberate exclusions from pages that should be discoverable.',
        ],
      },
      {
        heading: 'Turn findings into scoped implementation',
        body: 'A repair backlog names the affected route, observed failure, proposed change, and a verification step. Existing traffic and business importance guide the sequence. A small site may need a few repairs rather than a platform migration.',
        items: [
          'Review structured data against visible page content.',
          'Inspect rendering, mobile navigation, and internal linking.',
          'Use field performance data where available; label small samples.',
        ],
      },
      {
        heading: 'Keep Arizona expansion measurable',
        body: 'Before adding Phoenix, Scottsdale, or Tucson landing pages, resolve existing crawl and routing problems. New content needs a distinct purpose and a route that can be tested after deployment.',
        items: [
          'Keep established root-level article URLs when redesigning.',
          'Recheck changed routes after release.',
          'Track indexing, impressions, and accepted inquiries separately.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is technical SEO the same as writing more blog posts?',
        answer:
          'No. It focuses on whether useful existing pages can be discovered, rendered, indexed, and used. Content work can follow once the technical findings are understood.',
      },
      {
        question: 'Will every fix improve rankings?',
        answer:
          'No. We verify the repair itself and then observe search performance. Technical correctness does not guarantee rankings or a fixed indexing date.',
      },
    ],
    related: [
      {
        label: 'SEO services',
        href: '/services/seo',
      },
      {
        label: 'SEO audit',
        href: '/services/seo-audit',
      },
      {
        label: 'Arizona service areas',
        href: '/locations/arizona',
      },
    ],
  },
  {
    kind: 'service',
    slug: 'seo-audit',
    path: '/services/seo-audit',
    title: 'SEO Audit for Arizona Business Websites | ZiaFlow',
    description:
      'Review technical SEO, search intent, local visibility, and existing content. Receive a prioritized Arizona website audit with clear evidence and next steps.',
    heading: 'An SEO audit you can act on.',
    intro:
      'Find the gap between appearing in search and helping a visitor take the next step. The audit combines URL checks, authorized search data, content intent, and a review of the inquiry path.',
    sections: [
      {
        heading: 'One inventory before another content plan',
        body: 'We start with the pages and articles you already have. Duplicate topics, stale service descriptions, and broken incoming routes can matter more than publishing another location page.',
        items: [
          'Identify each page’s primary search intent.',
          'Compare live URLs with indexed and linked versions.',
          'Review titles and descriptions in the context of actual queries.',
        ],
      },
      {
        heading: 'Local relevance without location stuffing',
        body: 'An Arizona service-area business needs accurate coverage and a useful reason for each local page. We assess the relationship between your website, business information, service areas, and the services you actually deliver.',
        items: [
          'Separate service-area coverage from physical office claims.',
          'Check city pages for a distinct customer need and supporting detail.',
          'Review geographic targeting alongside inquiry quality.',
        ],
      },
      {
        heading: 'A prioritized handoff',
        body: 'Each recommendation includes evidence, an owner, an expected behavior change, and a check. Implementation can be scoped separately so the audit remains useful to your existing developer or marketing team.',
        items: [
          'Fix broken inquiry paths before cosmetic score improvements.',
          'Group overlapping content before proposing new URLs.',
          'Record a baseline with the property, date range, and limitations.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does the audit include implementation?',
        answer:
          'The audit defines findings and a repair backlog. Implementation scope, access, and acceptance checks are agreed separately.',
      },
      {
        question: 'Can you audit a WordPress, Shopify, or Wix site?',
        answer:
          'Yes. The review starts with public behavior and available reporting. Platform-specific implementation depends on access, plan capabilities, and the agreed scope.',
      },
    ],
    related: [
      {
        label: 'Technical SEO',
        href: '/services/technical-seo',
      },
      {
        label: 'Existing SEO service',
        href: '/services/seo',
      },
      {
        label: 'Request a website review',
        href: '/audit',
      },
    ],
  },
  {
    kind: 'service',
    slug: 'ppc-audit',
    path: '/services/ppc-audit',
    title: 'PPC Audit for Arizona Businesses | ZiaFlow',
    description:
      'Audit paid-search targeting, landing pages, conversion events, and lead quality. Prioritize account repairs before increasing your Arizona advertising budget.',
    heading: 'Know what your ads are buying.',
    intro:
      'A conversion column can count page visits, repeated clicks, or internal tests. We review the path from an ad click to a saved inquiry before treating those events as evidence of campaign performance.',
    sections: [
      {
        heading: 'Check conversion definitions first',
        body: 'We compare advertising events with the website behavior that triggers them. A contact-page visit, a form attempt, a saved inquiry, and a qualified opportunity are different measurements.',
        items: [
          'Test for page-load conversion triggers and duplicate event names.',
          'Separate QA, spam, and repeated submissions.',
          'Document which outcomes can actually be attributed to a campaign.',
        ],
      },
      {
        heading: 'Inspect spend and the landing experience',
        body: 'The audit connects account targeting with what the destination page promises. We look for irrelevant searches, incorrect service areas, mismatched offers, and mobile friction.',
        items: [
          'Review search terms, exclusions, schedules, and geographic settings.',
          'Check form errors, phone links, and campaign parameter handling.',
          'Separate brand demand from new-customer acquisition.',
        ],
      },
      {
        heading: 'Make the next budget decision reviewable',
        body: 'Recommendations are grouped into measurement repairs, targeting changes, landing-page work, and controlled tests. We do not assume that more spend or a new channel is the answer.',
        items: [
          'Record baseline spend and verified inquiry definitions.',
          'Name an owner and acceptance check for each repair.',
          'Use cost per qualified inquiry when qualification is available.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is this limited to Google Search Ads?',
        answer:
          'The starting scope is agreed around the accounts you use. Google Search and Microsoft Advertising can be reviewed together; social and other channels require their own conversion and creative review.',
      },
      {
        question: 'Does a PPC audit guarantee a lower cost per lead?',
        answer:
          'No. It identifies observed waste, measurement gaps, and test opportunities. Results depend on competition, offer, budget, landing experience, and follow-up.',
      },
    ],
    related: [
      {
        label: 'PPC management',
        href: '/services/ppc',
      },
      {
        label: 'Microsoft Ads',
        href: '/services/microsoft-ads',
      },
      {
        label: 'Performance tracking',
        href: '/services/performance-tracking',
      },
    ],
  },
  {
    kind: 'service',
    slug: 'crm',
    path: '/services/crm',
    title: 'CRM Setup & Lead Follow-Up for Arizona Businesses | ZiaFlow',
    description:
      'Organize inquiries, ownership, pipeline stages, and follow-up in your CRM. Connect Arizona website leads to a workflow your team can operate.',
    heading: 'Every inquiry needs an owner.',
    intro:
      'A CRM helps when people can see what arrived, who is responsible, and what happens next. We map the operational workflow before configuring fields, integrations, or reminders.',
    sections: [
      {
        heading: 'Define the pipeline around real decisions',
        body: 'The pipeline should distinguish an incoming inquiry from a qualified opportunity, a booked appointment, and a completed sale. Stage names and required information are agreed with the people using them.',
        items: [
          'Choose an owner and next action for each accepted inquiry.',
          'Define qualification, lost reasons, and handoff rules.',
          'Separate sales records from support and existing-client requests.',
        ],
      },
      {
        heading: 'Connect the entry points',
        body: 'Website forms, call tools, and booking systems can create overlapping records. We document the source contract and add repeat-submission handling where the connected systems support it.',
        items: [
          'Retain source page and supplied campaign parameters.',
          'Keep consent choices and contact preferences available.',
          'Test failed deliveries and duplicate submissions.',
        ],
      },
      {
        heading: 'Make follow-up maintainable',
        body: 'Automated reminders need an accountable human and a clear stop condition. We include an operator runbook so a small Arizona team can review exceptions without relying on the original builder.',
        items: [
          'Stop the relevant sequence after a reply or booking where supported.',
          'Keep a review queue for failed integrations.',
          'Measure accepted inquiries and stage movement separately.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do we need to replace our current CRM?',
        answer:
          'Not necessarily. We review the existing system and its integration capabilities before recommending a replacement.',
      },
      {
        question: 'Can this support a one-person business?',
        answer:
          'Yes. The initial workflow can be one pipeline, one owner, a small number of stages, and a clear daily follow-up list.',
      },
    ],
    related: [
      {
        label: 'Workflow automation',
        href: '/services/automation',
      },
      {
        label: 'Email marketing',
        href: '/services/email-marketing',
      },
      {
        label: 'Lead follow-up assessment',
        href: '/growth-tools/lead-follow-up-assessment',
      },
    ],
  },
  {
    kind: 'service',
    slug: 'email-marketing',
    path: '/services/email-marketing',
    title: 'Email Marketing & Follow-Up for Arizona Businesses | ZiaFlow',
    description:
      'Plan consent-aware welcome, follow-up, and reactivation email workflows. Connect email activity to your Arizona business’s inquiry and customer lifecycle.',
    heading: 'Email with a clear next step.',
    intro:
      'Useful email starts with why someone is receiving it and what they need next. We help service businesses connect inquiry responses, customer updates, and planned campaigns to an understandable lifecycle.',
    sections: [
      {
        heading: 'Separate service responses from campaigns',
        body: 'A receipt confirming an inquiry and a promotional nurture sequence serve different purposes. We define entry conditions, audience rules, and review responsibilities before preparing messages.',
        items: [
          'Map inquiry confirmation, follow-up, and customer education separately.',
          'Record contact preferences and suppression rules.',
          'Agree on a human review step before campaign activation.',
        ],
      },
      {
        heading: 'Build journeys around business events',
        body: 'A welcome sequence should not keep asking someone to book after they already booked. We plan reply and booking exits, exception handling, and the ownership of responses.',
        items: [
          'Use a stable person identifier and documented event names.',
          'Test duplicate entries and missing attributes.',
          'Keep a clear route from an email reply to a responsible person.',
        ],
      },
      {
        heading: 'Measure the outcome beyond opens',
        body: 'Email engagement is useful context, but the business result is a relevant reply, accepted inquiry, booking, or retained customer. Reporting needs to explain what is measured and what remains unknown.',
        items: [
          'Separate tests from real campaign activity.',
          'Review delivery, bounces, unsubscribes, and replies.',
          'Connect downstream outcomes only where reliable identifiers exist.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can you work with Customer.io?',
        answer:
          'Yes. We can scope event and profile mapping, message preparation, testing, and an operator runbook. Other email platforms are assessed against their available integrations.',
      },
      {
        question: 'Will new sequences immediately send to our whole list?',
        answer:
          'Audience selection, consent requirements, test results, and activation are reviewed before an agreed campaign is enabled.',
      },
    ],
    related: [
      {
        label: 'CRM setup',
        href: '/services/crm',
      },
      {
        label: 'Business email setup',
        href: '/services/email-setup',
      },
      {
        label: 'Automation',
        href: '/services/automation',
      },
    ],
  },
  {
    kind: 'service',
    slug: 'email-setup',
    path: '/services/email-setup',
    title: 'Business Email Setup for Arizona Companies | ZiaFlow',
    description:
      'Set up business-domain email, authentication records, shared inboxes, and reliable contact-form delivery for your Arizona company.',
    heading: 'Business email, set up properly.',
    intro:
      'Your domain email, contact forms, and marketing sender may use different systems. We document those systems and configure the agreed setup so routine messages have a clearer path to the right inbox.',
    sections: [
      {
        heading: 'Plan mailboxes and ownership',
        body: 'Before changing DNS, identify who owns the domain, which provider hosts the mail, and what needs to remain available. Shared addresses should have a clear owner and recovery process.',
        items: [
          'Inventory mailboxes, aliases, and forwarding rules.',
          'Agree on shared inbox and access requirements.',
          'Document account recovery and administrator ownership.',
        ],
      },
      {
        heading: 'Align the domain’s sending records',
        body: 'Email authentication must reflect the services that actually send for your domain. We inspect existing records before proposing changes so a website repair does not interrupt normal business email.',
        items: [
          'Review MX, SPF, DKIM, and DMARC configuration.',
          'Identify website, transactional, and marketing senders separately.',
          'Stage changes with verification and a rollback record.',
        ],
      },
      {
        heading: 'Test the website-to-inbox path',
        body: 'A form success message does not prove that an email arrived. We test accepted submissions and inspect delivery evidence where the provider exposes it.',
        items: [
          'Verify internal alerts and customer confirmations separately.',
          'Review bounce handling and reply-to behavior.',
          'Hand over a sender inventory and maintenance notes.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does authentication guarantee inbox placement?',
        answer:
          'No. Authentication is one part of delivery. Sender reputation, list quality, recipient systems, and message content also matter.',
      },
      {
        question: 'Can we keep Microsoft 365 or Google Workspace?',
        answer:
          'Yes. The setup can use your existing provider, subject to administrator access and its supported features.',
      },
    ],
    related: [
      {
        label: 'Website maintenance',
        href: '/services/website-maintenance',
      },
      {
        label: 'Email marketing',
        href: '/services/email-marketing',
      },
      {
        label: 'Contact ZiaFlow',
        href: '/contact',
      },
    ],
  },
  {
    kind: 'service',
    slug: 'website-maintenance',
    path: '/services/website-maintenance',
    title: 'Website Maintenance for Arizona Businesses | ZiaFlow',
    description:
      'Maintain website forms, links, content, dependencies, and deployments. Get a clear repair and verification process for your Arizona business website.',
    heading: 'Keep the useful parts working.',
    intro:
      'A business website needs routine attention after launch. We focus maintenance on the paths people use to find your services, contact your team, and receive a response.',
    sections: [
      {
        heading: 'Set a practical maintenance scope',
        body: 'A useful plan defines which platform, pages, integrations, and response windows are covered. New features and redesign work are scoped separately from routine upkeep.',
        items: [
          'Inventory hosting, domain, CMS, and integration ownership.',
          'Document backups or versioned recovery options.',
          'Separate urgent failures from planned improvements.',
        ],
      },
      {
        heading: 'Check the customer journey after changes',
        body: 'Updates can break routes, forms, or tracking even when a build succeeds. We pair technical checks with the website actions that matter to the business.',
        items: [
          'Verify key pages, phone links, forms, and booking destinations.',
          'Check redirects and canonical URLs after content changes.',
          'Review errors and deploy changes through a preview when available.',
        ],
      },
      {
        heading: 'Support the platform you actually use',
        body: 'Astro, WordPress, Shopify, and Wix have different maintenance models. The agreed plan reflects the platform’s access, dependencies, apps, and publishing process.',
        items: [
          'Assess plugin and theme changes for WordPress.',
          'Review apps, storefront behavior, and checkout boundaries for ecommerce.',
          'Provide a change log, verification evidence, and operator notes.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does maintenance include unlimited new pages?',
        answer:
          'No. The plan defines routine work and a request process. New service pages, integrations, and redesigns get an agreed scope.',
      },
      {
        question: 'Can you maintain a site you did not build?',
        answer:
          'Yes, after an access and condition review. Existing faults and unsupported components are documented before ongoing work is agreed.',
      },
    ],
    related: [
      {
        label: 'Web development',
        href: '/services/web-development',
      },
      {
        label: 'Ecommerce',
        href: '/services/ecommerce',
      },
      {
        label: 'Technical SEO',
        href: '/services/technical-seo',
      },
    ],
  },
  {
    kind: 'service',
    slug: 'ai-search',
    path: '/services/ai-search',
    title: 'AI Search & Answer Engine Optimization | ZiaFlow',
    description:
      'Improve clear, accessible business content for search and AI-assisted discovery. Connect AEO work to technical SEO, useful answers, and measurable evidence.',
    heading: 'Clear answers. Discoverable services.',
    intro:
      'AI search work should make your expertise easier to understand, not promise a shortcut into every generated answer. We connect answer-focused content with the technical and editorial work your website already needs.',
    sections: [
      {
        heading: 'Answer the questions behind a purchase',
        body: 'We organize pages around concrete customer decisions: what a service includes, who it fits, what access is needed, and what happens next. Each page should offer something useful beyond a repeated city name.',
        items: [
          'Use descriptive headings and direct answers.',
          'Explain scope, constraints, and source-backed factual claims.',
          'Keep business details consistent across important pages.',
        ],
      },
      {
        heading: 'Keep the fundamentals intact',
        body: 'Search engines need accessible, useful pages. We review crawlability, internal links, canonical URLs, and structured data that matches visible content.',
        items: [
          'Improve existing service pages before multiplying variants.',
          'Use appropriate schema without inventing certifications or locations.',
          'Maintain primary sources and review dates for changing facts.',
        ],
      },
      {
        heading: 'Measure discovery without promising placement',
        body: 'Search Console can show search performance; referral and inquiry records can add context where attribution is available. An appearance in an AI answer is not a guaranteed or permanent outcome.',
        items: [
          'Track the query and page evidence that is actually available.',
          'Label manual answer checks by engine and date.',
          'Assess accepted inquiries rather than counting mentions as revenue.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is AEO a replacement for SEO?',
        answer:
          'No. Clear answers, trustworthy content, and sound technical SEO overlap. AEO is a way to organize that work around the questions people ask.',
      },
      {
        question: 'Can schema guarantee an AI citation?',
        answer:
          'No. Structured data should describe visible content accurately. It does not guarantee an answer inclusion, citation, or ranking.',
      },
    ],
    related: [
      {
        label: 'Technical SEO',
        href: '/services/technical-seo',
      },
      {
        label: 'SEO audit',
        href: '/services/seo-audit',
      },
      {
        label: 'Software and AI tools',
        href: '/services/software',
      },
    ],
  },
  {
    kind: 'service',
    slug: 'microsoft-ads',
    path: '/services/microsoft-ads',
    title: 'Microsoft Ads for Arizona Businesses | ZiaFlow',
    description:
      'Evaluate Microsoft Advertising alongside Google Search. Plan account targeting, landing pages, and verified inquiry tracking for your Arizona business.',
    heading: 'A second search channel. A clear test.',
    intro:
      'Microsoft Advertising can be evaluated as a separate paid-search channel rather than treated as a guaranteed cheaper copy of Google Ads. The starting point is your offer, service area, account access, and a reliable inquiry definition.',
    sections: [
      {
        heading: 'Start with a channel-fit review',
        body: 'We look at existing search demand and whether your team can respond to the inquiries the campaign is designed to generate. A focused test needs a specific offer and a defined budget boundary.',
        items: [
          'Choose the service and service area to test.',
          'Review audience and network settings before launch.',
          'Define what counts as an accepted and qualified inquiry.',
        ],
      },
      {
        heading: 'Adapt the campaign and destination',
        body: 'Existing Google campaign work can inform the plan, but targeting, exclusions, assets, and landing-page behavior need their own review in the Microsoft account.',
        items: [
          'Check keywords and negative-keyword coverage.',
          'Match the landing page to the advertised service.',
          'Verify contact actions and campaign parameters before spending.',
        ],
      },
      {
        heading: 'Compare outcomes on consistent terms',
        body: 'Separate channel reports are useful only when conversion definitions are aligned. We compare spend with verified outcomes and flag gaps in call or booking attribution.',
        items: [
          'Exclude internal tests and duplicate form receipts.',
          'Review inquiry quality and response ownership.',
          'Decide whether to refine, pause, or expand based on observed results.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will Microsoft Ads always have a lower cost per lead?',
        answer:
          'No. Costs and inquiry quality depend on the market, targeting, offer, and competition. The purpose of a bounded test is to learn what holds for your business.',
      },
      {
        question: 'Should we stop Google Ads first?',
        answer:
          'Not automatically. We review the current account and measurement before recommending how to divide a limited budget.',
      },
    ],
    related: [
      {
        label: 'PPC audit',
        href: '/services/ppc-audit',
      },
      {
        label: 'PPC services',
        href: '/services/ppc',
      },
      {
        label: 'CRM and follow-up',
        href: '/services/crm',
      },
    ],
  },
  {
    kind: 'service',
    slug: 'linkedin-ads',
    path: '/services/linkedin-ads',
    title: 'LinkedIn Ads Planning for Arizona B2B Firms | ZiaFlow',
    description:
      'Plan LinkedIn advertising around a specific B2B audience, offer, and sales handoff. Connect Arizona campaign inquiries with CRM follow-up.',
    heading: 'Reach a business audience with purpose.',
    intro:
      'LinkedIn advertising needs a reason for the right person to respond. We scope the audience, offer, creative requirements, and sales handoff before recommending an account launch or larger media budget.',
    sections: [
      {
        heading: 'Define the buying situation',
        body: 'A job title is not a complete customer profile. The plan considers company fit, the decision involved, the offer, and what a sales conversation should accomplish.',
        items: [
          'Agree on audience inclusion and exclusions.',
          'Choose one primary action for the initial offer.',
          'Document the follow-up owner and response expectations.',
        ],
      },
      {
        heading: 'Connect the ad to a credible next step',
        body: 'A lead form or landing page should make the offer understandable and ask only for information the team will use. Creative and claims need review by the business before launch.',
        items: [
          'Align the ad, landing page, and follow-up message.',
          'Map lead fields and consent choices into the CRM.',
          'Verify access and delivery behavior for supported integrations.',
        ],
      },
      {
        heading: 'Review qualified outcomes',
        body: 'A low-cost form completion is not enough if the person does not fit the offer. We separate engagement, accepted inquiries, qualification, and booked conversations.',
        items: [
          'Keep test leads outside business reporting.',
          'Review audience quality with the person handling replies.',
          'Use a defined test budget and an explicit next decision.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is LinkedIn the right channel for every Arizona business?',
        answer:
          'No. It is a fit question, particularly for a specific B2B buying situation. Local consumer services may have a more direct starting point in search or local discovery.',
      },
      {
        question: 'Can you guarantee appointments?',
        answer:
          'No. We can define the campaign workflow and test its implementation. Responses and appointments depend on audience fit, offer, creative, budget, and follow-up.',
      },
    ],
    related: [
      {
        label: 'CRM setup',
        href: '/services/crm',
      },
      {
        label: 'PPC audit',
        href: '/services/ppc-audit',
      },
      {
        label: 'Email follow-up',
        href: '/services/email-marketing',
      },
    ],
  },
  {
    kind: 'industry',
    slug: 'home-services',
    path: '/industries/home-services',
    title: 'Home Services Marketing & Lead Intake Arizona | ZiaFlow',
    description:
      'Connect marketing, websites, and lead follow-up for Arizona HVAC, plumbing, roofing, and contractor businesses. Define service areas and dispatch ownership.',
    heading: 'From service inquiry to next action.',
    intro:
      'An HVAC repair call, a plumbing emergency, and a roof estimate require different follow-up. We connect the advertised service to an intake path your team can actually operate.',
    sections: [
      {
        heading: 'Match the workflow to the job',
        body: 'The first task is to distinguish urgent work from estimates and scheduled service. Routing should reflect the team’s actual hours, coverage, and qualification needs.',
        items: [
          'HVAC: separate repair, maintenance, and replacement requests.',
          'Plumbing: define urgent routing and after-hours ownership.',
          'Roofing: collect estimate context without promising immediate inspection.',
        ],
      },
      {
        heading: 'Choose channels by service and territory',
        body: 'Google Search, Local Services Ads, local SEO, and selected social campaigns serve different buying situations. Eligibility and account requirements are checked before a channel is included.',
        items: [
          'Use actual dispatch coverage for Phoenix-area and Tucson campaigns.',
          'Review service-area ZIP codes against operating capacity.',
          'Match the page offer to repair, estimate, or scheduled-service intent.',
        ],
      },
      {
        heading: 'Close the gap after an inquiry arrives',
        body: 'A saved request needs a responsible person and a next action. We map alerts, scheduling handoffs, and follow-up exits so automation supports the dispatcher rather than obscuring the queue.',
        items: [
          'Retain source page, requested service, and contact preference.',
          'Separate duplicate requests and internal tests.',
          'Track accepted requests, qualified jobs, and booked work as different stages.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do HVAC, plumbers, and roofers need separate sites?',
        answer:
          'Usually the first step is a useful service structure within the existing site. Separate pages are justified by a different service and customer decision, not merely different keywords.',
      },
      {
        question: 'Can we target only the areas our crews serve?',
        answer:
          'Yes. We define campaign territory from your operating coverage, then verify each platform’s supported location settings before launch.',
      },
    ],
    related: [
      {
        label: 'Local Services Ads',
        href: '/services/local-service-ads',
      },
      {
        label: 'Lead capture automation',
        href: '/services/automation',
      },
      {
        label: 'Arizona coverage',
        href: '/locations/arizona',
      },
    ],
  },
  {
    kind: 'industry',
    slug: 'healthcare',
    path: '/industries/healthcare',
    title: 'Healthcare Marketing & Website Workflows Arizona | ZiaFlow',
    description:
      'Plan public marketing websites and administrative inquiry workflows for Arizona doctors, health clinics, and IV clinics with clear privacy boundaries.',
    heading: 'Public marketing. Clear privacy boundaries.',
    intro:
      'Doctors, health clinics, and IV clinics need accurate service information and a clear route to the appropriate office. Our starting scope is public marketing content and administrative workflow planning, with patient-data handling assessed separately.',
    sections: [
      {
        heading: 'Make the public website useful',
        body: 'Prospective patients need clear practice information, service descriptions reviewed by the practice, office details, and the right scheduling destination. We do not invent clinical outcomes or treatment claims.',
        items: [
          'Keep doctor and clinic information accurate.',
          'Distinguish administrative questions from clinical requests.',
          'Route scheduling to the practice’s approved system.',
        ],
      },
      {
        heading: 'Map the data before choosing tools',
        body: 'A marketing form is not automatically suitable for patient intake. We document requested fields, destinations, tracking scripts, access, and provider agreements before a workflow involving sensitive information is considered.',
        items: [
          'Do not send patient details through ZiaFlow’s general inquiry form.',
          'Identify public marketing tools separately from approved patient systems.',
          'Have the practice’s privacy and compliance advisers review the proposed flow.',
        ],
      },
      {
        heading: 'Define a reviewable engagement',
        body: 'HIPAA-related requirements depend on the organization, data, roles, agreements, and configuration. This page does not certify ZiaFlow’s general marketing stack as a patient-data system.',
        items: [
          'Scope technical work and professional compliance review separately.',
          'Use synthetic examples during planning and testing.',
          'Measure administrative outcomes without placing patient details in marketing analytics.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is this a HIPAA-compliant patient intake product?',
        answer:
          'No blanket compliance claim is made here. A patient-data workflow requires a separate assessment of the systems, contracts, configuration, and operating responsibilities before implementation.',
      },
      {
        question: 'Do you work on Arizona doctor and IV clinic marketing?',
        answer:
          'We can scope public website, search, and administrative workflow work. The practice reviews service claims, clinical language, privacy requirements, and approved patient-system boundaries.',
      },
    ],
    related: [
      {
        label: 'Public website development',
        href: '/services/web-development',
      },
      {
        label: 'CRM workflow planning',
        href: '/services/crm',
      },
      {
        label: 'Arizona service coverage',
        href: '/locations/arizona',
      },
    ],
  },
  {
    kind: 'industry',
    slug: 'legal',
    path: '/industries/legal',
    title: 'Law Firm Marketing & Intake Workflows Arizona | ZiaFlow',
    description:
      'Plan search, law firm websites, and administrative intake workflows for Arizona lawyers. Keep practice-area content and engagement decisions under firm review.',
    heading: 'A clearer first step for legal inquiries.',
    intro:
      'Law firms need a website that explains the practice and gives prospective clients a usable next step. We help connect public marketing, administrative intake, and follow-up ownership while the firm controls legal judgment and engagement decisions.',
    sections: [
      {
        heading: 'Organize around practice-area decisions',
        body: 'Visitors need to understand whether the firm handles their general type of matter, where it works, and how to request a conversation. The firm reviews advertising claims and legal content before publication.',
        items: [
          'Separate practice areas where visitor needs are materially different.',
          'Use accurate lawyer, office, and service-area information.',
          'Avoid promises about case results or representation.',
        ],
      },
      {
        heading: 'Keep intake administrative',
        body: 'An automated acknowledgement should not make a legal assessment or imply that the firm accepted a matter. The initial workflow records the inquiry and sends it to the person responsible for review.',
        items: [
          'Agree on the minimum fields needed for initial routing.',
          'Use the firm’s approved process for conflict screening.',
          'Keep sensitive matter details out of advertising events and general marketing tools.',
        ],
      },
      {
        heading: 'Make handoffs visible',
        body: 'A request that reaches the wrong inbox can stall even when the form works. We define ownership, response steps, and the point where marketing follow-up stops.',
        items: [
          'Track accepted inquiries separately from retained clients.',
          'Document missed-call and after-hours routing.',
          'Use the firm’s approved systems for further intake and engagement.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will an AI agent decide whether to accept a case?',
        answer:
          'No. Legal advice, conflict decisions, and engagement approval stay with the firm. The scoped workflow supports administrative routing and follow-up.',
      },
      {
        question: 'Should attorney, lawyer, and legal marketing have separate pages?',
        answer:
          'Those terms can describe the same intent. We start with one useful legal industry hub and separate practice-area content only when the underlying needs justify it.',
      },
    ],
    related: [
      {
        label: 'PPC audit',
        href: '/services/ppc-audit',
      },
      {
        label: 'CRM and intake ownership',
        href: '/services/crm',
      },
      {
        label: 'Arizona locations',
        href: '/locations/arizona',
      },
    ],
  },
  {
    kind: 'location',
    slug: 'arizona',
    path: '/locations/arizona',
    title: 'Marketing, Websites & Automation in Arizona | ZiaFlow',
    description:
      'Explore marketing, website, CRM, and automation support for Arizona businesses. Plan Phoenix, Scottsdale, Tucson, and service-area campaigns around real coverage.',
    heading: 'Arizona coverage. A practical plan.',
    intro:
      'ZiaFlow works with Arizona businesses on websites, search, advertising, and inquiry follow-up. A useful local plan starts with where you actually serve customers and what your team can deliver there.',
    sections: [
      {
        heading: 'Phoenix metro and Tucson need operating context',
        body: 'A Phoenix service business, a Scottsdale professional practice, and a Tucson contractor may have different offers, response capacity, and service territories. We build the page and campaign plan around those differences.',
        items: [
          'Phoenix: connect the advertised service with actual metro coverage.',
          'Scottsdale: align professional-service offers with the intended customer.',
          'Tucson: plan its own operating territory rather than assuming Phoenix coverage.',
        ],
      },
      {
        heading: 'Use ZIP codes to define coverage, not multiply pages',
        body: 'A code such as 85302 belongs in the service-area planning conversation if you actually cover it. It is not, by itself, a reason to publish another nearly identical landing page.',
        items: [
          'Review Glendale, Peoria, and surrounding coverage with the business.',
          'Document East Valley coverage for Mesa, Tempe, Chandler, and Gilbert where relevant.',
          'Verify campaign boundaries and exclusions against the platform’s current controls.',
        ],
      },
      {
        heading: 'Choose the next page from evidence',
        body: 'New city pages need distinct service information, an audience need, and local details the business can verify. We start with the Arizona hub and add focused pages when that evidence exists.',
        items: [
          'Preserve established URLs and route legacy traffic to relevant content.',
          'Measure indexing, queries, and accepted inquiries by landing page.',
          'Consolidate overlapping intent with a documented redirect and internal-link update.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does listing a city mean ZiaFlow has an office there?',
        answer:
          'No. Service coverage and physical business locations are different. We do not claim an office in each city listed on this page.',
      },
      {
        question: 'Will you build a page for every Arizona ZIP code?',
        answer:
          'No. ZIP codes can inform coverage and campaign settings. A separate page needs a distinct purpose and useful verified content.',
      },
    ],
    related: [
      {
        label: 'Home services',
        href: '/industries/home-services',
      },
      {
        label: 'Healthcare',
        href: '/industries/healthcare',
      },
      {
        label: 'Law firms',
        href: '/industries/legal',
      },
      {
        label: 'Services',
        href: '/services',
      },
    ],
  },
];

export const pagesOfKind = (kind: ExpansionPage['kind']) => expansionPages.filter((page) => page.kind === kind);
