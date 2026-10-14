import type { PaginateFunction } from 'astro';
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Post } from '~/types';
import { APP_BLOG } from 'astrowind:config';
import { cleanSlug, trimSlash, BLOG_BASE, POST_PERMALINK_PATTERN, CATEGORY_BASE, TAG_BASE } from './permalinks';

const generatePermalink = async ({
  id,
  slug,
  publishDate,
  category,
}: {
  id: string;
  slug: string;
  publishDate: Date;
  category: string | undefined;
}) => {
  const year = String(publishDate.getFullYear()).padStart(4, '0');
  const month = String(publishDate.getMonth() + 1).padStart(2, '0');
  const day = String(publishDate.getDate()).padStart(2, '0');
  const hour = String(publishDate.getHours()).padStart(2, '0');
  const minute = String(publishDate.getMinutes()).padStart(2, '0');
  const second = String(publishDate.getSeconds()).padStart(2, '0');

  const permalink = POST_PERMALINK_PATTERN.replace('%slug%', slug)
    .replace('%id%', id)
    .replace('%category%', category || '')
    .replace('%year%', year)
    .replace('%month%', month)
    .replace('%day%', day)
    .replace('%hour%', hour)
    .replace('%minute%', minute)
    .replace('%second%', second);

  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
};

const getNormalizedPost = async (post: CollectionEntry<'post'>): Promise<Post> => {
  const { id, data } = post;
  const { Content, remarkPluginFrontmatter } = await render(post);

  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt,
    image,
    tags: rawTags = [],
    category: rawCategory,
    author,
    draft = false,
    metadata = {},
  } = data;

  const slug = cleanSlug(id); // cleanSlug(rawSlug.split('/').pop());
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;

  const category = rawCategory
    ? {
        slug: cleanSlug(rawCategory),
        title: rawCategory,
      }
    : undefined;

  const tags = rawTags.map((tag: string) => ({
    slug: cleanSlug(tag),
    title: tag,
  }));

  return {
    id: id,
    slug: slug,
    permalink: await generatePermalink({ id, slug, publishDate, category: category?.slug }),

    publishDate: publishDate,
    updateDate: updateDate,

    title: title,
    excerpt: excerpt,
    image: image,

    category: category,
    tags: tags,
    author: author,

    draft: draft,

    metadata,

    Content: Content,
    // or 'content' in case you consume from API

    readingTime: remarkPluginFrontmatter?.readingTime,
  };
};

interface SanityPostItem {
  _id: string;
  title: string;
  slug?: { current: string } | string;
  publishedAt?: string;
  _updatedAt?: string;
  seoDescription?: string;
  category?: string;
  authorName?: string;
  mainImageUrl?: string;
  body?: unknown[];
}

const estimateReadingTime = (body: unknown[] = []): number => {
  if (!Array.isArray(body)) return 3;
  let wordCount = 0;
  for (const block of body) {
    if (typeof block === 'object' && block !== null && 'children' in block) {
      const children = (block as { children?: Array<{ text?: string }> }).children;
      if (Array.isArray(children)) {
        for (const child of children) {
          if (child?.text) {
            wordCount += child.text.trim().split(/\s+/).filter(Boolean).length;
          }
        }
      }
    }
  }
  return Math.max(1, Math.ceil(wordCount / 200));
};

const getNormalizedSanityPost = async (sp: SanityPostItem): Promise<Post> => {
  const rawSlug = typeof sp.slug === 'string' ? sp.slug : sp.slug?.current || sp._id;
  const slug = cleanSlug(rawSlug);
  const publishDate = sp.publishedAt ? new Date(sp.publishedAt) : new Date();
  const updateDate = sp._updatedAt ? new Date(sp._updatedAt) : undefined;
  const categoryTitle = sp.category || 'Insights';

  const category = {
    slug: cleanSlug(categoryTitle),
    title: categoryTitle,
  };

  const permalink = await generatePermalink({
    id: sp._id,
    slug,
    publishDate,
    category: category.slug,
  });

  return {
    id: sp._id,
    slug,
    permalink,
    publishDate,
    updateDate,
    title: sp.title,
    excerpt: sp.seoDescription || '',
    image: sp.mainImageUrl || undefined,
    category,
    tags: [{ slug: cleanSlug(categoryTitle), title: categoryTitle }],
    author: sp.authorName || 'ZiaFlow Team',
    draft: false,
    metadata: {
      title: sp.title,
      description: sp.seoDescription || '',
    },
    sanityBody: sp.body,
    readingTime: estimateReadingTime(sp.body),
  };
};

const loadSanityPosts = async (): Promise<Array<Post>> => {
  try {
    const { sanityClient } = await import('sanity:client');
    const SANITY_POSTS_QUERY = `*[
      _type == "post"
      && defined(slug.current)
      && !(_id in path("drafts.**"))
      && publishedAt <= now()
    ]|order(publishedAt desc){
      _id,
      title,
      slug,
      publishedAt,
      _updatedAt,
      seoDescription,
      category,
      "authorName": authors[0]->name,
      "mainImageUrl": mainImage.asset->url,
      body
    }`;

    const sanityRawPosts = await sanityClient.fetch<SanityPostItem[]>(SANITY_POSTS_QUERY);
    if (!Array.isArray(sanityRawPosts)) return [];

    const normalized = await Promise.all(sanityRawPosts.map(getNormalizedSanityPost));
    return normalized;
  } catch (err) {
    console.warn('[Sanity Blog Sync] Could not fetch posts from Sanity client:', err);
    return [];
  }
};

const load = async function (): Promise<Array<Post>> {
  const [localPostsEntries, sanityPosts] = await Promise.all([
    getCollection('post').catch(() => [] as CollectionEntry<'post'>[]),
    loadSanityPosts(),
  ]);

  const normalizedLocalPosts = await Promise.all(
    (localPostsEntries as CollectionEntry<'post'>[]).map(async (post) => await getNormalizedPost(post))
  );

  const localActive = normalizedLocalPosts.filter((post) => !post.draft);

  // Combine and deduplicate by slug (local Markdown takes precedence if slug collision)
  const seenSlugs = new Set(localActive.map((p) => p.slug));
  const combined = [...localActive];

  for (const sPost of sanityPosts) {
    if (!seenSlugs.has(sPost.slug)) {
      seenSlugs.add(sPost.slug);
      combined.push(sPost);
    }
  }

  const results = combined.sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf());

  return results;
};

let _posts: Array<Post>;

/** */
export const isBlogEnabled = APP_BLOG.isEnabled;
export const isRelatedPostsEnabled = APP_BLOG.isRelatedPostsEnabled;
export const isBlogListRouteEnabled = APP_BLOG.list.isEnabled;
export const isBlogPostRouteEnabled = APP_BLOG.post.isEnabled;
export const isBlogCategoryRouteEnabled = APP_BLOG.category.isEnabled;
export const isBlogTagRouteEnabled = APP_BLOG.tag.isEnabled;

export const blogListRobots = APP_BLOG.list.robots;
export const blogPostRobots = APP_BLOG.post.robots;
export const blogCategoryRobots = APP_BLOG.category.robots;
export const blogTagRobots = APP_BLOG.tag.robots;

export const blogPostsPerPage = APP_BLOG?.postsPerPage;

/** */
export const fetchPosts = async (): Promise<Array<Post>> => {
  if (!_posts) {
    _posts = await load();
  }

  return _posts;
};

/** */
export const findPostsBySlugs = async (slugs: Array<string>): Promise<Array<Post>> => {
  if (!Array.isArray(slugs)) return [];

  const posts = await fetchPosts();

  return slugs.reduce(function (r: Array<Post>, slug: string) {
    posts.some(function (post: Post) {
      return slug === post.slug && r.push(post);
    });
    return r;
  }, []);
};

/** */
export const findPostsByIds = async (ids: Array<string>): Promise<Array<Post>> => {
  if (!Array.isArray(ids)) return [];

  const posts = await fetchPosts();

  return ids.reduce(function (r: Array<Post>, id: string) {
    posts.some(function (post: Post) {
      return id === post.id && r.push(post);
    });
    return r;
  }, []);
};

/** */
export const findLatestPosts = async ({ count }: { count?: number }): Promise<Array<Post>> => {
  const _count = count || 4;
  const posts = await fetchPosts();

  return posts ? posts.slice(0, _count) : [];
};

/** */
export const getStaticPathsBlogList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogListRouteEnabled) return [];
  return paginate(await fetchPosts(), {
    params: { blog: BLOG_BASE || undefined },
    pageSize: blogPostsPerPage,
  });
};

/** */
export const getStaticPathsBlogPost = async () => {
  if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];
  return (await fetchPosts()).flatMap((post) => ({
    params: {
      blog: post.permalink,
    },
    props: { post },
  }));
};

/** */
export const getStaticPathsBlogCategory = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogCategoryRouteEnabled) return [];

  const posts = await fetchPosts();
  const categories = {};
  posts.map((post) => {
    if (post.category?.slug) {
      categories[post.category?.slug] = post.category;
    }
  });

  return Array.from(Object.keys(categories)).flatMap((categorySlug) =>
    paginate(
      posts.filter((post) => post.category?.slug && categorySlug === post.category?.slug),
      {
        params: { category: categorySlug, blog: CATEGORY_BASE || undefined },
        pageSize: blogPostsPerPage,
        props: { category: categories[categorySlug] },
      }
    )
  );
};

/** */
export const getStaticPathsBlogTag = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogTagRouteEnabled) return [];

  const posts = await fetchPosts();
  const tags = {};
  posts.map((post) => {
    if (Array.isArray(post.tags)) {
      post.tags.map((tag) => {
        tags[tag?.slug] = tag;
      });
    }
  });

  return Array.from(Object.keys(tags)).flatMap((tagSlug) =>
    paginate(
      posts.filter((post) => Array.isArray(post.tags) && post.tags.find((elem) => elem.slug === tagSlug)),
      {
        params: { tag: tagSlug, blog: TAG_BASE || undefined },
        pageSize: blogPostsPerPage,
        props: { tag: tags[tagSlug] },
      }
    )
  );
};

/** */
export async function getRelatedPosts(originalPost: Post, maxResults: number = 4): Promise<Post[]> {
  const allPosts = await fetchPosts();
  const originalTagsSet = new Set(originalPost.tags ? originalPost.tags.map((tag) => tag.slug) : []);

  const postsWithScores = allPosts.reduce((acc: { post: Post; score: number }[], iteratedPost: Post) => {
    if (iteratedPost.slug === originalPost.slug) return acc;

    let score = 0;
    if (iteratedPost.category && originalPost.category && iteratedPost.category.slug === originalPost.category.slug) {
      score += 5;
    }

    if (iteratedPost.tags) {
      iteratedPost.tags.forEach((tag) => {
        if (originalTagsSet.has(tag.slug)) {
          score += 1;
        }
      });
    }

    acc.push({ post: iteratedPost, score });
    return acc;
  }, []);

  postsWithScores.sort((a, b) => b.score - a.score);

  const selectedPosts: Post[] = [];
  let i = 0;
  while (selectedPosts.length < maxResults && i < postsWithScores.length) {
    selectedPosts.push(postsWithScores[i].post);
    i++;
  }

  return selectedPosts;
}
