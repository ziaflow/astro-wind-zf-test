# ZiaFlow Kairo Content & Image Replacement Guide

This document defines the visual asset strategy, image specifications, content briefs, and editable copy blocks across the **Home**, **About**, **Services**, and **Contact** pages for the ZiaFlow Kairo redesign.

All image assets live in:
`src/kairo/assets/images/` (resolved via `src/kairo/utils/image.ts`)

---

## 1. Visual Strategy & Core Image Registry

To maximize credibility, minimize page weight, and avoid launch delays, ZiaFlow follows a **3-tier visual hierarchy**:

1. **Tier 1 — Real ZiaFlow Work & People (Primary):** Real portrait of Jeremy, real workspace, actual client case studies, and verified operator quotes.
2. **Tier 2 — Contextual Commercial Photography (Secondary):** Clean service-business imagery (HVAC, plumbing, electrical, commercial contracting) and Phoenix metro context sourced under commercial license from [Pexels](https://www.pexels.com/) or [Unsplash](https://unsplash.com/).
   *Rule: Never imply that pictured stock models are clients or staff.*
3. **Tier 3 — Custom SVG/HTML Workflow Graphics & Subtle AI Textures (Supporting):** Precise vector diagrams explaining the **Capture → Assignment → Follow-Up** pipeline; subtle AI-rendered textures strictly for abstract dark background atmospheres (never for people or fabricated UI).

### The 6–8 Core Image System (Launch Pool)

Rather than maintaining dozens of disconnected assets, the launch uses **8 distinct high-quality core images**, cropped and rendered responsively across components:

| Core ID | Asset Name | Primary Subject & Source | Base Export | Component Crops & Reuses |
| :--- | :--- | :--- | :--- | :--- |
| **IMG-01** | `hero-service-operations.webp` | Real or licensed field service technician on diagnostic tablet (HVAC/commercial) | 1920 × 1440 (4:3) | • Home Hero Moment 1 (3:4 crop: `1200×1600`)<br>• Services Hero (`1920×1080` 16:9) |
| **IMG-02** | `workflow-dispatch-desk.webp` | Real ZiaFlow desk/workstation with live lead routing and monitor | 1920 × 1080 (16:9) | • Home Story Wall Tile (`800×1000` 4:5)<br>• Contact Card (`1200×900` 4:3)<br>• About Milestone (`1200×675` 16:9) |
| **IMG-03** | `jeremy-portrait.webp` | Authentic portrait of Jeremy (Founder & Lead Systems Engineer) | 1200 × 1600 (3:4) | • About Page Leadership (`800×1066` 3:4)<br>• Author badge on blog guides (`400×400` 1:1) |
| **IMG-04** | `phoenix-metro-architecture.webp` | High-contrast black & white / architectural crop of Greater Phoenix commercial district | 1920 × 1280 (3:2) | • About Hero (`1200×1600` 3:4)<br>• Manifesto micro-badge (`600×340` 16:9)<br>• About Milestone 2021 (`1200×1200` 1:1) |
| **IMG-05** | `mobile-lead-notification.webp` | Phone screen in dark setting displaying urgent dispatch alert | 1200 × 1600 (3:4) | • Home Hero Floating Badge (`800×1066` 3:4)<br>• How It Works Step 3 (`1200×1600` 3:4)<br>• Manifesto micro-badge (`600×340` 16:9) |
| **IMG-06** | `pipeline-lead-log.webp` | Genuine lead database UI (Supabase intake log showing timestamp, attribution, and status) | 1920 × 1200 (16:10) | • Product Reveal Backdrop (`1920×1080` 16:9)<br>• Services CRO Section (`1200×800` 3:2)<br>• Case Study Card (`1200×1500` 4:5) |
| **IMG-07** | `commercial-facility-service.webp` | Professional commercial service site (clean plant, facility, or modern storefront) | 1920 × 1280 (3:2) | • Home Hero Moment 2 (`1200×1600` 3:4)<br>• Case Study Cover (`1200×1500` 4:5)<br>• How It Works Step 1 (`1200×1200` 1:1) |
| **IMG-08** | `cta-spark-dark.webp` | Deep charcoal / dark textured geometric atmosphere | 1920 × 1080 (16:9) | • Home Closing CTA Parallax (`1920×1080` 16:9)<br>• Services Footer CTA |

---

## 2. GSC Evidence & Search Intent Strategy

*Data Baseline:* Latest verified GSC sample (October 23–25, 2026): **120 property impressions, zero clicks; homepage accounts for 51 impressions.**
*Decision:* Cautious prioritization. Protect established relevance by aligning title, H1, introduction, and CTA around Arizona service businesses, websites, and lead follow-up. Do not execute speculative keyword rewrites.

### Implementation Sequence
```
Phase 1: Connected Pair (Homepage + Automation Service Page)
   │
   ├─► Connect to: Arizona Automation Article (/marketing-automation-for-arizona-service-businesses...)
   └─► Connect to: Phoenix Conversion Checklist (/website-conversion-checklist-for-phoenix-businesses)
   │
Phase 2: Trust & Intake (About Page + Contact Page)
   │
Phase 3: Remaining Services (SEO, Web Development, PPC, CRO, Performance Tracking)
```

---

## 3. Connected Pair Brief: Homepage & Automation Service Page

### 3.1 Homepage Brief (`/`)

- **Audience:** Arizona business owners and operational managers seeking to capture more value from existing search traffic and ads without wasted ad spend.
- **Search Evidence:** Branded `ziaflow` queries; non-branded discovery queries around `marketing automation phoenix` (pos ~16) and `arizona web development`.
- **Primary Deliverable:** **Lead Capture & Follow-Up Sprint**.
- **Defensible Contract:** *For every agreed inquiry source, each accepted inquiry is recorded, assigned an owner, given a next action, and tracked to a known status.*
- **Title Tag:** `ZiaFlow | Web Engineering, Lead Capture & Follow-Up Automation`
- **Meta Description:** `ZiaFlow fixes the gap between customer contact and booked revenue for Arizona service businesses with documented lead capture, instant routing, and accountable follow-up.`
- **H1:** `Turn Inbound Inquiries into Booked Jobs with ZiaFlow.`
- **Primary CTA:** `Book Consultation` → Microsoft Bookings Intake
- **Secondary CTA:** `Explore Lead Audit` → `#audit` (Complimentary Forensic Video)
- **Direct Phone:** `(602) 834-4239` (clickable `tel:+16028344239` in header and footer)

#### Reusable Core Asset Assignments on Homepage:
- **Hero Moments:** `IMG-01` (`story-halden.jpg`), `IMG-07` (`story-solvane.jpg`), `IMG-06` (`story-mirelab.jpg`), `IMG-02` (`story-aerowin.jpg`).
- **Hero Floating Badge:** `IMG-05` (`step-brief.jpg`).
- **Manifesto Micro Badges:** `IMG-01` (`manifesto-face.jpg`), `IMG-04` (`manifesto-city.jpg`), `IMG-05` (`manifesto-hand.jpg`).
- **Product Reveal Center:** `IMG-06` (`journal-face.jpg`).
- **Product Reveal 4-Tile Grid:** `IMG-02` (`gallery-corridor.jpg`), `IMG-02` (`gallery-desk.jpg`), `IMG-04` (`gallery-street.jpg`), `IMG-06` (`gallery-window.jpg`).
- **Capabilities Orbit:** `IMG-08` (`capability-lights.jpg`).
- **How It Works Steps:** `IMG-07` (`step-connect.jpg`), `IMG-06` (`step-watch.jpg`), `IMG-05` (`step-brief.jpg`).
- **Closing CTA:** `IMG-08` (`cta-spark.jpg`).

---

### 3.2 Automation Service Page Brief (`/services/automation`)

- **Audience:** Operators needing to connect web forms, Google Local Service Ads, and phone lines to a CRM with instant staff notification and prospect follow-up.
- **Search Evidence:** Top impressions in GSC: `marketing automation phoenix` (pos 16.4), `marketing automation for smbs arizona` (pos 12.8), `crm automation for small business arizona` (pos 20.1).
- **Page Purpose:** Detail the scope, deliverables, process, and acceptance criteria of the **Lead Capture & Follow-Up Sprint**.
- **Title Tag:** `Lead Capture & Follow-Up Automation for Arizona Businesses | ZiaFlow`
- **Meta Description:** `Automate lead intake, CRM routing, and prospect follow-up. Turn website inquiries and Google LSAs into booked jobs with ZiaFlow's fixed-scope Sprint.`
- **H1:** `Lead Capture & Follow-Up Automation for Arizona Service Businesses`
- **Subhead:** `Never let a qualified customer wait hours for a reply. We audit your lead paths, instrument instant routing, and leave a documented operating runbook your team owns.`
- **Core Deliverables (Fixed-Scope Sprint):**
  1. *Lead-Path Audit:* Every form, phone tracking number, and LSA endpoint mapped to final disposition.
  2. *Capture Repair:* Verification that every submission enters the database without silent failures.
  3. *Instant Notification:* SMS/email dispatch to designated staff with source attribution and next action.
  4. *Immediate Acknowledgement:* Automated confirmation to the customer establishing expectations.
  5. *Status Pipeline:* Structured tracking from inquiry to booked consultation.
  6. *Operator Runbook:* Plain-English guidelines for staff triage and exception handling.
- **Contextual Internal Links:**
  - Link to related article: `/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings`
  - Link to diagnostic tool: `/website-conversion-checklist-for-phoenix-businesses`
  - Link to intake: `/contact#form`
- **Primary CTA:** `Schedule Sprint Discovery` → Microsoft Bookings or Contact Form.

---

## 4. About Page Brief (`/about`)

- **Audience:** Prospective clients verifying the authenticity, technical leadership, and physical location of ZiaFlow.
- **Search Evidence:** Branded discovery queries and commercial validation searches.
- **Title Tag:** `About ZiaFlow | Phoenix Web Engineering & Workflow Automation`
- **Meta Description:** `Learn about ZiaFlow, a Greater Phoenix digital transformation agency engineering fast websites, reliable lead intake, and automated business systems.`
- **H1:** `Engineering Systems for Businesses That Convert.`
- **Founder Profile:** Jeremy — Principal & Lead Systems Engineer. Real portrait (`IMG-03`), documented local presence in Phoenix, AZ.
- **Key Proof Points:**
  - `Phoenix, Arizona` foundation (2021).
  - `100+` projects delivered across web engineering, integrations, and performance marketing.
  - `10K+` operational hours saved through automated workflows.
- **Values:** Operators First, Show the Evidence, Fast by Default, Transparent Partnership.

---

## 5. Contact Us Page Brief (`/contact`)

- **Audience:** Qualified prospects ready to discuss a website redesign, lead follow-up sprint, or technical audit.
- **Search Evidence:** High-intent conversion queries (`ziaflow contact`, `phone`, `hire`).
- **Priority:** **Conversion Reliability & Accessibility.**
- **Title Tag:** `Contact ZiaFlow | Phoenix Web Engineering & Lead Automation`
- **Meta Description:** `Contact ZiaFlow. Call (602) 834-4239 or submit your project details below for same-day triage and consultation scheduling in Phoenix, AZ.`
- **H1:** `Contact the ZiaFlow Engineering Team`
- **Direct Phone:** `(602) 834-4239` (click-to-call prominently displayed above form).
- **Direct Email:** `info@ziaflow.com`.
- **Direct Booking:** Live Microsoft Bookings calendar integration.
- **Form Requirements:**
  - Container must have `id="form"` so `#form` links from any page smoothly anchor to the input fields.
  - Requires database write confirmation from `/api/contact` into Supabase `leads` before showing success message.
  - Fields: Full Name, Work Email, Phone Number, Business Name, Service Interest, Project Details.

---

## 6. Technical & Image Export Rules

1. **File Naming:** Use lowercase, hyphenated descriptive names (e.g. `phoenix-commercial-lead-dispatch.webp`), never camera defaults or arbitrary timestamps.
2. **Alt Text:** Descriptive and contextual. Example:
   - *Good:* `alt="ZiaFlow lead dispatch dashboard showing incoming inquiry attribution and status in Phoenix AZ"`
   - *Bad:* `alt="image"` or `alt="dashboard"`
3. **Responsive Generation:** Export primary master files in WebP or AVIF at `q=82` for optimal quality-to-byte ratio. Let Astro's `<Image />` component handle 480w, 800w, and 1200w srcset generations.
4. **License Records:** Maintain a local registry of license attribution for all Pexels/Unsplash assets in `docs/asset-licenses.md`.
