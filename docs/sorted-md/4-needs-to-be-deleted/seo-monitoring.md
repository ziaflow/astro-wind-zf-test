---
description: Run a comprehensive SEO and technical health check on the website.
---

# SEO Agent Monitoring Workflow

This workflow performs a series of checks to ensure the website is technically sound and optimized for search engines.

## 1. Broken Link Check

**Goal:** Ensure all internal links are working and there are no 404 errors.
**Action:**

1.  Navigate to the homepage.
2.  Extract all internal links.
3.  Visit each link and verify it loads with a 200 OK status.
4.  Report any broken links.

## 2. Mobile Responsiveness Check

**Goal:** Verify the site looks good on mobile devices.
**Action:**

1.  Set viewport to 375x812 (iPhone X).
2.  Navigate to key pages (Home, Services, About).
3.  Take screenshots of the viewport.
4.  Check for horizontal scrolling or overlapping elements.

## 3. Metadata Verification

**Goal:** Ensure every page has unique and optimized titles and descriptions.
**Action:**

1.  Extract `<title>` and `<meta name="description">` from key pages.
2.  Verify length (Title < 60 chars, Desc < 160 chars).
3.  Check for duplicates.

## 4. Analytics Health Check

**Goal:** Confirm tracking scripts are firing.
**Action:**

1.  Check `src/config.yaml` for valid GA4 and GTM IDs.
2.  Verify the scripts are present in the page source.

---

**How to run this:**
Simply ask the agent: "Run the SEO Monitoring workflow" or "Check the site health".
