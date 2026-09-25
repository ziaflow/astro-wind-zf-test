---
name: frontend-ui-ux
description: >-
  Use this skill when working on frontend UI/UX tasks including component design,
  responsive layouts, Tailwind CSS styling, accessibility, performance optimization,
  image handling, and visual polish. Activate for any UI component work, styling
  changes, or user experience improvements.
---

# Frontend, UI/UX & Web Development Skill

This project uses **Tailwind CSS 3** with the typography plugin for styling.

## Design System

### Typography
- Primary font: Inter (variable, via `@fontsource-variable/inter`)
- Heading classes: `font-heading`, `tracking-tighter`, `leading-tighter`
- Body uses Tailwind defaults with Inter as the base

### Color Approach
- Light-only theme configured in `src/config.yaml` (`theme: 'light:only'`)
- Uses Tailwind's standard palette plus custom dark variants where needed
- Accent colors should be consistent across CTAs

### Component Patterns
Widgets in `src/components/widgets/` follow this structure:
```astro
---
import WidgetWrapper from '../ui/WidgetWrapper.astro';
// Props interface with id, isDark, classes, bg
const { title, subtitle, items = [], id, isDark, classes, bg } = Astro.props;
---
<WidgetWrapper id={id} isDark={isDark} containerClass={...} bg={bg}>
  <!-- Content -->
</WidgetWrapper>
```

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`
- Root scales at 2xl: `2xl:text-[20px]` (in Layout.astro)
- Images use `content-visibility: auto` globally for performance

## Image Handling

### Critical Rules
- **DO NOT** force all content images to 500×500 — use appropriate aspect ratios
- Remote images use `unpic` for optimization but srcset may not actually resize
- Prefer local assets when possible for reliability
- Image domains allowed: `cdn.pixabay.com`, Supabase storage bucket
- Always provide meaningful `alt` text

### Image Component
```astro
import Image from '~/components/common/Image.astro';
<Image
  src={imageSrc}
  width={768}
  height={512}
  alt="Descriptive alt text"
  layout="responsive"
/>
```

## Accessibility Checklist
- [ ] Every `<img>` has meaningful `alt` text
- [ ] Interactive elements have `focus` styles
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Forms have associated `<label>` elements
- [ ] Heading hierarchy is sequential (h1 → h2 → h3)
- [ ] Links have descriptive text (no "click here")
- [ ] Skip-to-content link exists
- [ ] ARIA attributes used only when native HTML is insufficient

## Performance Best Practices
- Lazy load below-fold images (`loading="lazy"`)
- Use `content-visibility: auto` for off-screen sections
- Minimize JavaScript — prefer Astro's zero-JS default
- Use `@astrojs/prefetch` for perceived performance
- Compress assets via `astro-compress` integration
- Avoid layout shifts — always specify image dimensions

## Tailwind Conventions
- Use `tailwind-merge` (`twMerge`) for conditional class merging
- Custom config in `tailwind.config.js` — check before adding custom utilities
- Typography plugin enabled for prose content (blog posts)

## Common UI Tasks

### Add a new widget section
1. Create component in `src/components/widgets/`
2. Use `WidgetWrapper` for consistent spacing and dark mode support
3. Accept `id`, `isDark`, `classes`, `bg` props
4. Import and place in the page's `.astro` file

### Style a CTA button
```html
<a class="btn btn-primary" href="/contact">Get Started</a>
```
Button styles defined globally — check `tailwind.css` for `btn` classes.

### Make a section responsive
- Start with mobile layout
- Add `md:` and `lg:` breakpoint variants
- Test at 375px, 768px, 1024px, 1440px widths
