---
publishDate: 2025-11-25T00:00:00Z
updateDate: 2026-10-28T16:55:00.000Z
title: 'How to Tackle Website Analysis Tasks: Pricing, Icons, and Colors'
excerpt: 'Website analysis is the technical evaluation of a site’s pricing structures, UI asset libraries, and visual design systems using browser developer tools and automated extractors.'
image: '~/assets/images/blog/website-analysis-tasks.png'
category: 'Conversion Optimization'
tags:
  - website analysis
  - pricing
  - icons
  - color scheme
  - developer tools
metadata:
  canonical: https://ziaflow.com/website-analysis-tasks
---

**Website analysis is the technical evaluation of a website's layout, UI asset libraries, and visual design systems to uncover conversion structures, extract reusable digital assets, and audit competitor positioning.** To analyze any website efficiently, practitioners inspect pricing models through DOM hierarchy and network triggers, isolate icon assets via SVG sprite and font inspection, and generate color palettes by sampling raster imagery with palette extraction algorithms.

### Key Takeaways & Quick Overview

- **Pricing Discovery**: Scan top navigation menus, footer sitemaps, and search the DOM tree for keywords like `pricing`, `plans`, and `tier`.
- **Icon Extraction**: Inspect SVG symbols in the Elements tab or filter HTTP requests in the Network tab under `Img` and `Font`.
- **Color Scheme Sampling**: Extract dominant hex codes from key visual assets using color extraction tools (Coolors, Adobe Color) and verify WCAG contrast ratios.

---

## 1. How to Find All Pricing Sections on a Website

To find all pricing sections on a website, check the primary navigation and footer links first, then inspect the DOM tree for pricing component containers and filter the Network tab for subscription API endpoints. Most commercial websites place pricing tables under `/pricing`, within product comparison anchors, or inside modal checkouts.

### Direct Navigation and Page Footers

Check the primary header navigation and secondary footer sitemaps for links titled "Pricing," "Plans," "Subscriptions," "Enterprise," or "Compare Tiers." Dedicated pricing pages host the canonical billing matrices and tier breakdowns. If no direct link exists, check the navigation menu under "Products" or look for high-visibility "Get Started" buttons that route directly to pricing selectors.

### Visual Scanning for Pricing Cards

Look for distinct multi-column grid layouts with recurring visual patterns such as price tags, billing cadence switches (monthly vs. annual toggles), checklist features, and distinct CTA buttons. Tiered pricing designs usually highlight a central "Recommended" or "Most Popular" card with contrasting border styling or elevation badges.

### Browser Developer Tools DOM Search

1. Right-click the page, open DevTools (`Ctrl+Shift+I` or `Cmd+Option+I`), and activate the **Elements** panel.
2. Press `Ctrl+F` (or `Cmd+F`) to search the HTML source code for selectors such as `id="pricing"`, `class="pricing"`, `class="plans"`, `data-tier`, or `data-plan`.
3. Use the element picker tool (`Ctrl+Shift+C`) to click visible cards, immediately exposing the underlying pricing container attributes and hidden plan data in the DOM tree.

---

## 2. How to See and Extract All Icons on a Website

To see and extract all icons on a website, filter asset requests in the browser's Network panel by image and font MIME types, inspect inline SVG tags in the Elements tree, and retrieve favicon assets from standard header link tags. Modern websites load icons as vector SVGs, CSS sprite sheets, or web font glyphs.

### Extracting Favicons and App Icons

Locate the website's favicon by inspecting the `<head>` section of the HTML document for `<link rel="icon">` or `<link rel="apple-touch-icon">` elements. Alternatively, open your browser and navigate directly to `[domain.com]/favicon.ico` or utilize specialized favicon extraction endpoints to retrieve high-resolution PNG and SVG variants.

### Network Panel Filtering for Icons and SVGs

1. Open DevTools and switch to the **Network** tab.
2. Refresh the target page to capture every asset request during initial rendering.
3. Filter by **Img** to view standalone SVG, WebP, and PNG icon files, or filter by **Font** to identify icon font bundles like Font Awesome or Material Icons (`.woff2`, `.woff`).
4. Click any asset in the list to preview the icon, inspect its dimensions, and copy its direct URL or SVG markup.

### Elements Panel Inspection for Inline SVGs

Inline SVGs do not trigger separate image network requests because their code sits directly within the page markup. In the Elements panel, search the DOM for `<svg>` elements, right-click the root tag, and select **Copy > Copy element** to capture the complete vector markup including viewBox coordinates and path coordinates.

---

## 3. How to Extract and Build a Better Color Scheme From an Image

To build a balanced website color scheme from an image, sample the dominant and accent hues using an automated palette extractor, organize the colors into semantic UI roles, and test background-to-text contrast against WCAG accessibility standards. Visual imagery provides organic color harmonies that make digital interfaces look cohesive.

### Selecting the Anchor Brand Image

Choose an image that directly reflects the intended tone, brand personality, and industry aesthetic of your website build. Natural photographs produce earthy, balanced tones, architectural photography provides sharp neutral palettes, and high-tech product renders deliver modern tech palettes with electric accent contrasts.

### Using Palette Extraction Tools

1. Upload the chosen image into a palette generator such as Coolors, Adobe Color, Canva Palette Generator, or Colormind.
2. The generator extracts 4 to 6 dominant hex color codes, identifying primary background shades, secondary support hues, and high-visibility accents.
3. Lock the strongest brand colors and cycle alternate tonal variations for complementary accents until you have a complete design system.

### Semantic Mapping and WCAG Contrast Verification

Distribute the extracted hex values into clear functional roles: 60% neutral surface colors (backgrounds and card wrappers), 30% primary brand colors (navigation, headers, badges), and 10% high-contrast accent colors (primary action buttons and alerts). Finally, run text and background pairs through a WCAG contrast checker to ensure body text achieves at least a 4.5:1 contrast ratio.

---

## Summary of Website Analysis Methods

Website analysis combines automated browser diagnostics with visual heuristics to extract critical UI and commercial data. To evaluate pricing, navigate to dedicated URLs or search DOM trees for tier classes. To capture icons, filter the Network panel for SVG/Font assets and copy inline vector tags. To generate color schemes, sample image palettes and validate them against WCAG accessibility guidelines before applying them to CSS design tokens.

