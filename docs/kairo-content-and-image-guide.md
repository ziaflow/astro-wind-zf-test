# ZiaFlow Kairo Content & Image Replacement Guide

This document contains every image file name, target crop aspect ratio, recommended export dimensions, file size limits, and current editable copy across the **Home**, **About**, **Services**, and **Contact** pages.

All image assets live in:
`src/kairo/assets/images/` (resolved via `src/kairo/utils/image.ts`)

---

## Quick Image Specification Summary

| Context | Aspect Ratio | Target Dimensions | Max File Size | Format |
| :--- | :--- | :--- | :--- | :--- |
| **Landscape Hero / Banners** | 16:9 | 1920 × 1080 px | < 300 KB | WebP / AVIF |
| **Portrait Cards / Cases** | 3:4 | 1200 × 1600 px | < 200 KB | WebP / AVIF |
| **Story Grid Cards** | 4:5 | 1200 × 1500 px | < 200 KB | WebP / AVIF |
| **Square Process / Avatars** | 1:1 | 800 × 800 px (or 1200 × 1200) | < 120 KB | WebP / AVIF |
| **Inline Micro Badges** | ~16:9 | 600 × 340 px | < 60 KB | WebP / AVIF |
| **OpenGraph Social Preview** | 1.91:1 | 1200 × 630 px | < 70 KB | JPG / WebP |

---

## 1. Home Page (`/` / `src/pages/kairo-preview.astro`)

### 1.1 Header / Navbar
- **Data File:** `src/kairo/data/navbar.ts` & `src/kairo/data/site.ts`
- **Component:** `src/kairo/components/shared/layout/navbar.astro`

#### Assets
- **Logo:** `public/images/logo.svg` (vector) or `src/assets/images/ziaflow_com_updated.png` (1000 × 1000 px square PNG)

#### Copy
```yaml
brand_name: "ZiaFlow"
phone_number: "(602) 834-4239"
phone_href: "tel:+16028344239"
primary_cta:
  label: "Book Consultation"
  href: "https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled"
secondary_cta:
  label: "Contact"
  href: "/contact"
navigation_links:
  - { label: "Home", href: "/" }
  - { label: "Services", href: "/services" }
  - { label: "Blog", href: "/blog" }
  - { label: "About", href: "/about" }
  - { label: "Contact", href: "/contact" }
```

---

### 1.2 Hero Section
- **Data File:** `src/kairo/data/home.ts` (`hero`) & `src/kairo/data/hero.ts` (`moments`)
- **Component:** `src/kairo/components/home/hero.astro`

#### Images Required
| File Name | Crop / Aspect Ratio | Target Export Size | Description / Subject |
| :--- | :--- | :--- | :--- |
| `story-halden.jpg` | 3:4 Portrait | 1200 × 1600 px | Hero slide 1: Service technician / digital intake |
| `story-solvane.jpg` | 3:4 Portrait | 1200 × 1600 px | Hero slide 2: Commercial operations team coordinating inquiries |
| `story-mirelab.jpg` | 3:4 Portrait | 1200 × 1600 px | Hero slide 3: Dashboard tracking active inquiries |
| `story-aerowin.jpg` | 3:4 Portrait | 1200 × 1600 px | Hero slide 4: Client communication & calendar booking |
| `step-brief.jpg` | 3:4 Portrait | 800 × 1066 px | Floating foreground card: phone screen showing dispatch notification |

#### Copy
```yaml
hero_headline_line_1: "Turn inbound inquiries into"
hero_headline_line_2: "booked jobs with"
hero_headline_accent: "ZiaFlow."
hero_intro: "ZiaFlow fixes the gap between customer contact and booked revenue for Arizona service businesses with documented lead capture, instant routing, and accountable follow-up."

moments:
  - client: "Lead Intake Audit"
    label: "inquiries logged to database"
    value: 100
    suffix: "%"
  - client: "Follow-Up Sprint"
    label: "instant confirmation sent"
    value: 1
    suffix: " min"
  - client: "Lead Ownership"
    label: "unassigned inquiries"
    value: 0
    suffix: ""
  - client: "Pipeline Status"
    label: "inquiry-to-booking visibility"
    value: 24
    suffix: "/7"
```

---

### 1.3 Operational Ticker
- **Data File:** `src/kairo/data/logos.ts`
- **Component:** `src/kairo/components/home/logos.astro`

#### Copy
```yaml
section_label: "Integrated across your operational tools and CRM stack"
ticker_items:
  - "Web Forms"
  - "Phone Routing"
  - "Local Service Ads"
  - "CRM Dispatch"
  - "Database Logging"
  - "Booking Calendar"
  - "Status Pipeline"
```

---

### 1.4 Manifesto Section
- **Data File:** `src/kairo/data/home.ts` (`manifesto`)
- **Component:** `src/kairo/components/home/manifesto.astro`

#### Images Required (Inline Micro Badges)
| File Name | Crop / Aspect Ratio | Target Export Size | Description |
| :--- | :--- | :--- | :--- |
| `manifesto-face.jpg` | 16:9 Wide | 600 × 340 px | Focus on communication / missed moment |
| `manifesto-city.jpg` | 16:9 Wide | 600 × 340 px | Phoenix commercial building / business district |
| `manifesto-hand.jpg` | 16:9 Wide | 600 × 340 px | Hand holding phone with dispatched lead notification |

#### Copy
```yaml
eyebrow: "Why ZiaFlow"
text_part_1: "Most service businesses lose revenue between the click and the first phone call."
# [manifesto-face.jpg]
text_part_2: "Leads slip through unmonitored forms, missed voicemail, and delayed replies."
# [manifesto-city.jpg]
text_part_3: "ZiaFlow captures every accepted inquiry, assigns an owner, triggers instant response,"
# [manifesto-hand.jpg]
text_part_4: "and tracks every prospect to a known status."
```

---

### 1.5 Product Reveal / Interactive Story Wall
- **Data File:** `src/kairo/data/home.ts` (`productStory`)
- **Component:** `src/kairo/components/home/product-reveal.astro`

#### Images Required (Streamlined 4-Tile Layout)
| File Name | Crop / Aspect Ratio | Target Export Size | Role |
| :--- | :--- | :--- | :--- |
| `journal-face.jpg` | 16:9 Landscape | 1920 × 1080 px | Central backdrop image |
| `gallery-corridor.jpg` | 4:5 Portrait | 800 × 1000 px | Top-left floating card |
| `gallery-desk.jpg` | 4:5 Portrait | 800 × 1000 px | Top-right floating card |
| `gallery-street.jpg` | 4:5 Portrait | 800 × 1000 px | Bottom-left floating card |
| `gallery-window.jpg` | 4:5 Portrait | 800 × 1000 px | Bottom-right floating card |

#### Copy
```yaml
background_title: ["Inquiry to", "booked job."]

act_1:
  tab: "Capture"
  title: "Every inquiry, recorded."
  body: "Website forms, phone calls, Google LSAs, and chat route directly into a unified database."
  count: 24
  unit: "inquiries logged"

act_2:
  tab: "Route"
  title: "Assigned in seconds."
  body: "Instant notifications alert the accountable owner with source attribution so no lead sits idle."
  count: 100
  unit: "% assigned"

act_3:
  tab: "Convert"
  title: "Tracked to a known status."
  body: "Structured follow-up keeps every accepted inquiry moving toward a booked consultation or clear quote."
  count: 1
  unit: "pipeline view"
```

---

### 1.6 Capabilities Section
- **Data File:** `src/kairo/data/home.ts` (`capabilities`)
- **Component:** `src/kairo/components/home/capabilities.astro`

#### Images Required
| File Name | Crop / Aspect Ratio | Target Export Size | Role |
| :--- | :--- | :--- | :--- |
| `capability-lights.jpg` | 16:9 Landscape | 1600 × 900 px | Background for integration orbit card |

#### Copy
```yaml
section_title: "Everything it takes to keep every lead accountable."

card_detect:
  title: "Spots the leak"
  body: "Identifies failed form submissions, broken phone tracking, and slow follow-up before leads go cold."
  badge_label: "Form error flagged"

card_connect:
  title: "Plugs into your tools"
  body: "Web forms, call tracking, CRM, and email. Read-only connectors and webhooks set up without code disruption."

card_rank:
  title: "Ranks by urgency"
  body: "Inquiries are prioritized by urgency and intent so immediate service requests get same-hour attention."
  items:
    - { title: "Emergency Service Call", value: "Immediate dispatch" }
    - { title: "Commercial Website Scope", value: "Discovery scheduled" }
    - { title: "Local Service Ad Inquiry", value: "Follow-up sent" }

card_brief:
  title: "Writes the dispatch brief"
  body: "Clear dispatch notification sent directly to your phone or inbox with prospect details, source, and assigned next action."
  sample_brief: "New inquiry from Phoenix via Google LSA. Service: Lead Capture Sprint. Contact: (602) 834-4239. Assigned owner: Intake. Next action: Schedule discovery call."

card_privacy:
  title: "Private & verified"
  body: "Field-level validation, encrypted database storage, and spam protection. Client data is never shared or used to train external models."
```

---

### 1.7 How It Works (The 3 Sprint Steps)
- **Data File:** `src/kairo/data/steps.ts`
- **Component:** `src/kairo/components/home/how-it-works.astro`

#### Images Required
| File Name | Crop / Aspect Ratio | Target Export Size | Step |
| :--- | :--- | :--- | :--- |
| `step-connect.jpg` | 1:1 Square | 1200 × 1200 px | Step 1: Capture & Map |
| `step-watch.jpg` | 3:4 Portrait | 1200 × 1600 px | Step 2: Ownership & Alerts |
| `step-brief.jpg` | 3:4 Portrait | 1200 × 1600 px | Step 3: Status & Booking |

#### Copy
```yaml
section_title: "The Lead Capture & Follow-Up Sprint."

step_1:
  verb: "Capture"
  tag: "Audit & Map"
  title: "Map every inquiry source into one verified record."
  body: "Web forms, phone tracking, Google Local Service Ads, and booking requests are connected through verified endpoints into a centralized lead database."
  points:
    - "Form and call endpoints verified for reliable capture"
    - "Timestamped database record for every accepted submission"
    - "Zero lost inquiries from unmonitored inboxes or broken links"

step_2:
  verb: "Assign"
  tag: "Ownership & Alerts"
  title: "Every accepted inquiry gets an owner and a next step."
  body: "Automated confirmation reaches the prospect immediately, while internal notifications dispatch the inquiry directly to the accountable team member."
  points:
    - "Immediate prospect acknowledgement with expected next steps"
    - "Assigned to dedicated staff by service type or territory"
    - "Escalation alerts if an inquiry sits unaddressed"

step_3:
  verb: "Track"
  tag: "Status & Booking"
  title: "Tracked from first touch to booked consultation."
  body: "Inquiries move through defined milestones — received, contacted, quoted, or booked — leaving a measurable operating process for your team."
  points:
    - "Daily intake log with source attribution and current status"
    - "Clear exception handling for unreached prospects"
    - "Verified data baseline for marketing ROI and close rates"
```

---

### 1.8 Customer Stories & Testimonials
- **Data Files:** `src/kairo/data/home.ts` (`storiesSection`), `src/kairo/data/customers/*.md`, `src/kairo/data/proof.ts`
- **Components:** `src/kairo/components/home/stories.astro` & `src/kairo/components/home/proof.astro`

#### Images Required
| File Name | Crop / Aspect Ratio | Target Export Size | Context |
| :--- | :--- | :--- | :--- |
| `story-aerowin.jpg` | 4:5 Portrait | 1200 × 1500 px | Case study cover: Operations |
| `story-corvid.jpg` | 4:5 Portrait | 1200 × 1500 px | Case study cover: Web engineering |
| `story-halden.jpg` | 4:5 Portrait | 1200 × 1500 px | Case study cover: Commercial intake |
| `story-ledgerly.jpg` | 4:5 Portrait | 1200 × 1500 px | Case study cover: Lead pipeline |
| `portrait-ines.jpg` | 3:4 Portrait or 1:1 | 800 × 800 px | Testimonial: S. K., Comptroller |
| `portrait-maren.jpg` | 3:4 Portrait or 1:1 | 800 × 800 px | Testimonial: K. B., COO |
| `portrait-tobi.jpg` | 3:4 Portrait or 1:1 | 800 × 800 px | Testimonial: M. D., Managing Partner |

#### Copy
```yaml
stories_title: "Documented results from real operations."
stories_body: "Arizona service businesses and growth operators use ZiaFlow to ensure no inquiry slips through the cracks."
stories_cta: { label: "Explore Services", href: "/services" }

proof_title: "What business operators say."

testimonial_1:
  quote: "ZiaFlow transformed our business operations with their automation solutions. Their tailored approach and technical expertise streamlined our lead intake, saving us hours each week and boosting our follow-up velocity."
  name: "K. B."
  role: "Chief Operating Officer"
  company: "Operations Group"
  metric: { value: 100, suffix: "%", label: "intake workflow automation" }

testimonial_2:
  quote: "ZiaFlow is a top-notch engineering partner with reliable service, deep technical knowledge, and direct communication. They do not over-promise; they deliver exactly what was scoped."
  name: "J. M."
  role: "Commercial Investor"
  company: "Capital & Real Estate"
  metric: { value: 24, suffix: "hr", label: "deployment turnaround" }

testimonial_3:
  quote: "When it comes to web performance, form tracking, and SEO architecture, ZiaFlow is remarkably knowledgeable and efficient. They gave our team clear visibility into our lead attribution."
  name: "S. K."
  role: "Comptroller"
  company: "Financial & Advisory Services"
  metric: { value: 100, suffix: "%", label: "attributed lead sources" }
```

---

### 1.9 Audit Booking Section
- **Component:** `src/kairo/components/home/audit-section.astro`
- **Embeds:** `src/components/widgets/AuditBookingForm.astro`

#### Copy
```yaml
badge: "Complimentary Analysis"
heading: "Find exactly where your site is losing revenue."
subheading: "No sales scripts or aggressive pitches. We inspect your production build and record a 10-minute forensic video breaking down your technical bottlenecks."
deliverables:
  - title: "Core Web Vitals & Real-Device Speed"
    desc: "Laboratory and real-user mobile performance analysis, render-blocking scripts, and server response times."
  - title: "Conversion Leaks & UX Friction"
    desc: "Cognitive load and mobile friction points preventing qualified visitors from booking or calling."
  - title: "Inquiry & Form Pipeline Health"
    desc: "Live inspection of your submission handlers, validation errors, and CRM routing to ensure zero dropped leads."
```

---

### 1.10 Closing CTA
- **Data File:** `src/kairo/data/home.ts` (`closingCta`)
- **Component:** `src/kairo/components/shared/cta.astro`

#### Images Required
| File Name | Crop / Aspect Ratio | Target Export Size | Description |
| :--- | :--- | :--- | :--- |
| `cta-spark.jpg` | 16:9 Landscape | 1920 × 1080 px | Dark textured architectural or atmospheric background |

#### Copy
```yaml
title: "Stop Losing Inquiries Between Click and Call."
body: "Schedule a 30-minute discovery session with our Phoenix team. We will review your lead path and scope a Lead Capture & Follow-Up Sprint."
cta_button:
  label: "Book Consultation"
  href: "https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled"
```

---

### 1.11 Footer
- **Data File:** `src/kairo/data/footer.ts`
- **Component:** `src/kairo/components/shared/layout/footer.astro`

#### Copy
```yaml
heading: "Contact ZiaFlow"
subheading: "Direct Phoenix contact channels for inquiries and support"
contact_channels:
  - { label: "Direct Phone", value: "(602) 834-4239", href: "tel:6028344239" }
  - { label: "Inquiry Email", value: "info@ziaflow.com", href: "mailto:info@ziaflow.com" }
  - { label: "Consultation", value: "Book Meeting", href: "https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled" }
column_1_services:
  - { label: "Automation & Lead Sprints", href: "/services/automation" }
  - { label: "Technical SEO", href: "/services/seo" }
  - { label: "PPC & Local Service Ads", href: "/services/ppc" }
  - { label: "Web Development & CRO", href: "/services/web-development" }
  - { label: "Ecommerce Platforms", href: "/services/ecommerce" }
column_2_articles:
  - { label: "Marketing Automation for Arizona Service Businesses", href: "/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings" }
  - { label: "Website Conversion Checklist for Phoenix Businesses", href: "/website-conversion-checklist-for-phoenix-businesses" }
  - { label: "Google Local Service Ads: SEO & Quality Playbook", href: "/google-local-service-ads-in-2025" }
column_3_company:
  - { label: "Home", href: "/" }
  - { label: "About", href: "/about" }
  - { label: "Contact ZiaFlow", href: "/contact" }
legal:
  copyright: "© 2026 ZiaFlow"
  terms_href: "/terms"
  privacy_href: "/privacy"
```

---

## 2. About Page (`/about`)
- **Data Files:** `src/kairo/data/about.ts` & `src/kairo/data/pages.ts` (`aboutPage`)
- **Components:** `src/kairo/components/about/*`

### Images Required
| File Name | Crop / Aspect Ratio | Target Export Size | Context |
| :--- | :--- | :--- | :--- |
| `about-hero.jpg` | 3:4 Portrait | 1200 × 1600 px | Hero visual: Phoenix engineering workspace |
| `about-city.jpg` | 1:1 Square | 1200 × 1200 px | Milestone 2021: Phoenix founding |
| `gallery-desk.jpg` | 16:9 Landscape | 1200 × 675 px | Milestone 2023: Systems integration |
| `about-studio.jpg` | 16:9 Landscape | 1200 × 675 px | Milestone 2025: Search & conversion systems |
| `gallery-tower.jpg` | 3:4 Portrait | 1200 × 1600 px | Milestone 2026: Sprint engagements |
| `team-amara.jpg` | 3:4 Portrait | 800 × 1066 px | Jeremy — Principal & Lead Systems Engineer |
| `team-jonas.jpg` | 3:4 Portrait | 800 × 1066 px | Systems & Architecture Lead |
| `team-lin.jpg` | 3:4 Portrait | 800 × 1066 px | Data & Automation Lead |
| `team-rafael.jpg` | 3:4 Portrait | 800 × 1066 px | Search & CRO Lead |
| `team-sade.jpg` | 3:4 Portrait | 800 × 1066 px | Client Operations Lead |
| `team-viktor.jpg` | 3:4 Portrait | 800 × 1066 px | Commercial Strategy Advisory |
| `public/images/og/about.jpg` | 1.91:1 Landscape | 1200 × 630 px | OpenGraph Social Sharing Card |

### Copy
```yaml
meta:
  title: "About ZiaFlow"
  description: "ZiaFlow is a Phoenix-based digital engineering and transformation agency specializing in web performance, lead intake automation, and conversion systems."

hero:
  headline: ["Engineering systems", "for businesses", "that convert."]
  intro: "Based in Phoenix, Arizona, ZiaFlow helps service businesses, e-commerce brands, and local operators unlock their potential through custom web engineering, marketing automation, and conversion systems."
  facts:
    - { value: 2021, label: "Founded in Phoenix" }
    - { value: 100, suffix: "+", label: "Projects Delivered" }
    - { value: 10, suffix: "K+ hrs", label: "Hours Saved via Automation" }

values:
  - title: "Operators first"
    body: "We build for business outcomes — booked jobs, clean data, and streamlined operations — rather than vanity metrics."
  - title: "Show the evidence"
    body: "Every accepted inquiry has a timestamped record, source attribution, and assigned owner. Trust is built on checkable facts."
  - title: "Fast by default"
    body: "Sub-second Astro architectures, clean Tailwind CSS, and zero bloated scripts slowing down mobile visitors."
  - title: "Transparent partnership"
    body: "No opaque marketing jargon or lock-in contracts. We deliver documented operating workflows your team owns."
```

---

## 3. Services Page (`/services`)
- **Page File:** `src/pages/services.astro` & `src/pages/services/*`

### Images Required (Replacing Unsplash Hotlinks)
| Target File Name | Crop / Aspect Ratio | Target Export Size | Context / Section |
| :--- | :--- | :--- | :--- |
| `services-hero.jpg` | 16:9 Landscape | 1920 × 1080 px | Services Hero: Modern service technician with diagnostic tablet |
| `services-maze.jpg` | 3:2 Landscape | 1200 × 800 px | Section: "Feeling Lost in the Local Search Maze?" |
| `services-partner.jpg`| 3:2 Landscape | 1200 × 800 px | Section: "ZiaFlow - Your Local Growth Partner" |
| `services-steps.jpg` | 3:2 Landscape | 1200 × 800 px | Section: "Our Simple 3-Step Growth Plan" |

### Copy
```yaml
meta_title: "Web Engineering, Lead Capture & Workflow Automation | ZiaFlow"
meta_description: "Google Local Service Ads, custom web engineering, and lead follow-up automation for Arizona businesses. Call (602) 834-4239 to discuss your pipeline."

hero_tagline: "Arizona Lead Capture & Engineering Experts"
hero_title: "Web Engineering, Lead Capture & Workflow Automation for Arizona Businesses"
hero_subtitle: "Convert search traffic into verified booked jobs with reliable form intake, Google Local Service Ads, and rapid follow-up automation."

core_services:
  - title: "Lead Capture & Follow-Up Sprint"
    desc: "Map, instrument, and automate your inquiry path from first click to booked meeting."
    href: "/services/automation"
  - title: "Google Local Service Ads (LSAs)"
    desc: "Pay-per-lead campaigns managed for maximum ROI and lead quality across Arizona."
    href: "/services/local-service-ads"
  - title: "Google Business Profile Optimization"
    desc: "Local-first profiles that increase search visibility, direct calls, and verified reviews."
    href: "/services/gmb-optimization"
  - title: "Conversion Rate Optimization (CRO)"
    desc: "Sub-second Astro web development, form friction removal, and forensic speed audits."
    href: "/services/cro"
  - title: "Performance Tracking & Reporting"
    desc: "Transparent lead logs, source attribution, and weekly ROI dashboards in Supabase."
    href: "/services/performance-tracking"
```

---

## 4. Contact Us Page (`/contact`)
- **Page File:** `src/pages/contact.astro`
- **Sales Form Component:** `src/kairo/components/pricing/sales-form.astro`
- **Data File:** `src/kairo/data/pages.ts` (`pricingPage.sales`)

### Images Required
| File Name | Crop / Aspect Ratio | Target Export Size | Description |
| :--- | :--- | :--- | :--- |
| `gallery-window.jpg` | 16:9 or 4:3 | 1200 × 900 px | Clean laptop workstation showing lead intake dashboard |

### Copy
```yaml
meta_title: "Contact ZiaFlow | Phoenix Web Engineering & Lead Automation"
meta_description: "Get in touch with ZiaFlow. Call (602) 834-4239 or submit your project details below for same-day triage and consultation scheduling."

hero_tagline: "Get In Touch"
hero_title: "Contact the ZiaFlow Engineering Team"
hero_subtitle: "Ready to eliminate the gap between customer inquiries and booked jobs? Call us directly for immediate assistance or submit your project details below."

direct_channels:
  phone: "(602) 834-4239"
  phone_href: "tel:+16028344239"
  email: "info@ziaflow.com"
  booking_url: "https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled"
  location: "Phoenix, Arizona — Serving Arizona & Nationwide Clients"

form_fields:
  name:
    label: "Full Name"
    placeholder: "Alex Morgan"
    error: "Tell us what to call you."
  email:
    label: "Work Email"
    placeholder: "alex@company.com"
    error: "Use a valid work email address."
  phone:
    label: "Phone Number"
    placeholder: "(602) 555-0199"
  company:
    label: "Company / Business Name"
    placeholder: "Your Business or Brand"
  service_interest:
    label: "Service Interest"
    options:
      - "Lead Capture & Follow-Up Sprint"
      - "Custom Web Development & Astro"
      - "Local SEO & Google LSAs"
      - "Custom Automation & Webhooks"
  message:
    label: "Tell us about your project"
    placeholder: "What challenges are you facing with your current site or lead intake? What are your goals?"

submission_messages:
  sending: "Recording inquiry..."
  success: "Thank you, {name}. Your inquiry is recorded in our database. We will review your details and contact {email} within one business day."
  disclaimer: "By submitting this form, you agree to our privacy policy. Your information is stored securely in Supabase and never shared."
```
