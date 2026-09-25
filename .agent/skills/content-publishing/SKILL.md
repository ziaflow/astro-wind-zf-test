---
name: content-publishing
description: >-
  Use this skill when creating, editing, or managing blog posts and content.
  Covers content collections, frontmatter format, AI blogger workflow, Sanity
  integration, and content quality guidelines.
---

# Content Publishing Skill

## Content Sources

This project has two content pipelines:

### 1. File-based (Astro Content Collections)
- Manual posts: `src/data/post/*.md` or `*.mdx`
- AI-generated posts: `src/data/post-generated/*.mdx`
- Configured in `src/content/config.ts`

### 2. Sanity CMS
- Project ID: `92p0tpps`, Dataset: `production`
- Studio: `studio-gemini-blog/`
- Used by AI blogger for automated publishing

## Blog Post Frontmatter

```yaml
---
title: Your Post Title
publishDate: 2026-01-15T09:00:00.000Z
excerpt: >-
  A brief summary used in listings and llms.txt. Keep under 160 characters.
category: Web Development   # Web Development, SEO, Marketing, Automation
author: Jeremy
draft: false                 # Set true to hide from production
metadata:
  description: >-
    Meta description for search engines. Under 160 characters.
  canonical: https://ziaflow.com/your-post-slug  # Only if different from auto-generated
---
```

## Content Rules

### Duplicate Prevention
- Before creating a new post, check existing titles in `post/` and `post-generated/`
- Normalize titles for comparison (lowercase, remove punctuation)
- Only ONE post per topic should be `draft: false`
- Example: Three "Web Development in 2026" variants existed — two were drafted

### Quality Checks
- [ ] Title is under 60 characters
- [ ] Excerpt/description is under 160 characters
- [ ] Category matches an existing category
- [ ] No placeholder content (`YOUR_*`, `TODO`, empty sections)
- [ ] All links use valid URLs (no `#` placeholders in published content)
- [ ] Images have alt text

### AI Blogger Safeguards
The AI blogger (`scripts/ai-blogger.ts`) currently:
- Publishes directly to Sanity (no draft mode) ⚠️
- Has a concurrency guard in CI (only one run at a time)
- Uses `gpt-5.2` model
- Converts Markdown to Portable Text as plain paragraphs (loses formatting) ⚠️

**Recommended improvements** (not yet implemented):
- Create as drafts, not published posts
- Use a proper Markdown-to-Portable-Text parser
- Add Zod validation on AI output
- Add idempotency checks before creating
