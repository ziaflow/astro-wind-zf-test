import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'src', 'data', 'post-generated');

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || '92p0tpps';
const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || '2023-05-03';
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_TOKEN,
  useCdn: false,
});

const imageBuilder = createImageUrlBuilder(client);

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
  && publishedAt <= now()
]|order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  mainImage,
  authors[]->{
    name
  },
  category,
  body,
  seoDescription
}`;

const escapeInlineCode = (value = '') => value.replace(/`/g, '\\`');

const escapeMdText = (value = '') => value.replace(/([*_])/g, '\\$1');

const getMarkDef = (markDefs, mark) => markDefs.find((item) => item._key === mark);

const serializeSpans = (children = [], markDefs = []) =>
  children
    .map((child) => {
      if (!child || child._type !== 'span') {
        return '';
      }

      let text = escapeMdText(child.text || '');

      for (const mark of child.marks || []) {
        if (mark === 'strong') {
          text = `**${text}**`;
          continue;
        }

        if (mark === 'em') {
          text = `*${text}*`;
          continue;
        }

        if (mark === 'code') {
          text = `\`${escapeInlineCode(child.text || '')}\``;
          continue;
        }

        const definition = getMarkDef(markDefs, mark);
        if (definition?._type === 'link' && definition.href) {
          text = `[${text}](${definition.href})`;
        }
      }

      return text;
    })
    .join('');

const serializeBlock = (block) => {
  if (block._type === 'image' && block.asset) {
    const imageUrl = imageBuilder.image(block).width(1600).url();
    return imageUrl ? `![](${imageUrl})` : '';
  }

  if (block._type === 'code' && typeof block.code === 'string') {
    const language = block.language || '';
    return `\`\`\`${language}\n${block.code}\n\`\`\``;
  }

  if (block._type !== 'block') {
    return '';
  }

  const content = serializeSpans(block.children, block.markDefs);
  if (!content.trim()) {
    return '';
  }

  if (block.listItem) {
    return null;
  }

  if (block.style === 'blockquote') {
    return content
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
  }

  if (/^h[1-6]$/.test(block.style || '')) {
    const level = Number(block.style.slice(1));
    return `${'#'.repeat(level)} ${content}`;
  }

  return content;
};

const serializeList = (blocks, startIndex) => {
  const first = blocks[startIndex];
  const ordered = first.listItem === 'number';
  const lines = [];
  let index = startIndex;
  let counter = 1;

  while (index < blocks.length) {
    const block = blocks[index];
    if (!block || block._type !== 'block' || !block.listItem) {
      break;
    }

    const indent = '  '.repeat(Math.max(0, (block.level || 1) - 1));
    const bullet = ordered ? `${counter}. ` : '- ';
    lines.push(`${indent}${bullet}${serializeSpans(block.children, block.markDefs)}`);

    index += 1;
    counter += 1;
  }

  return {
    markdown: lines.join('\n'),
    nextIndex: index,
  };
};

const portableTextToMarkdown = (blocks = []) => {
  const parts = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];

    if (block?._type === 'block' && block.listItem) {
      const { markdown, nextIndex } = serializeList(blocks, index);
      if (markdown) {
        parts.push(markdown);
      }
      index = nextIndex;
      continue;
    }

    const markdown = serializeBlock(block);
    if (markdown) {
      parts.push(markdown);
    }
    index += 1;
  }

  return parts.join('\n\n').trim();
};

const buildFrontmatter = (post) => {
  const authorNames = (post.authors || []).map((author) => author?.name).filter(Boolean);
  const imageUrl = post.mainImage ? imageBuilder.image(post.mainImage).width(1600).url() : undefined;

  return {
    title: post.title,
    publishDate: post.publishedAt ? new Date(post.publishedAt) : undefined,
    excerpt: post.seoDescription || undefined,
    image: imageUrl,
    category: post.category || undefined,
    author: authorNames.join(', ') || undefined,
    draft: false,
    metadata: {
      description: post.seoDescription || undefined,
    },
  };
};

const toMdxDocument = (post) => {
  const frontmatter = yaml.dump(buildFrontmatter(post), {
    lineWidth: 0,
    noRefs: true,
    skipInvalid: true,
  });
  const body = portableTextToMarkdown(post.body || []);

  return `---\n${frontmatter}---\n\n${body}\n`;
};

const cleanOutputDirectory = async () => {
  await fs.mkdir(outputDir, { recursive: true });
  const entries = await fs.readdir(outputDir, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
      .map((entry) => fs.unlink(path.join(outputDir, entry.name)))
  );
};

const writePosts = async (posts) => {
  await Promise.all(
    posts.map(async (post) => {
      const filename = `${post.slug}.mdx`;
      const filePath = path.join(outputDir, filename);
      await fs.writeFile(filePath, toMdxDocument(post), 'utf8');
    })
  );
};

const run = async () => {
  await cleanOutputDirectory();
  const posts = await client.fetch(POSTS_QUERY);
  await writePosts(posts);
  console.log(`Synced ${posts.length} Sanity posts to ${path.relative(rootDir, outputDir)}.`);
};

run().catch((error) => {
  console.error('Failed to sync Sanity posts:', error);
  process.exit(1);
});
