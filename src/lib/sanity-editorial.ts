import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url';

// Explicitly project the fields this page renders; keep draft selection separate from editorial approval.
export const POST_QUERY = `*[_type == "post" && slug.current == $slug && publishedAt <= now()][0]{
  title, seoTitle, seoDescription, mainImage, publishedAt, lastReviewedAt, body,
  "authors": authors[]->{_id, name, bio, role, credentials, profileUrl, socialUrls, "imageUrl": image.asset->url}
}`;

export interface SanityAuthor {
  _id?: string;
  name?: string;
  bio?: string;
  role?: string;
  credentials?: string[];
  profileUrl?: string;
  socialUrls?: string[];
  imageUrl?: string;
}

export interface SanityPost {
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  mainImage?: SanityImageSource & { alt?: string };
  publishedAt?: string;
  lastReviewedAt?: string;
  body?: PortableTextBlock | PortableTextBlock[];
  authors?: (SanityAuthor | null)[];
}

export function webUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function editorialDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function postPresentation(post: SanityPost) {
  const published = editorialDate(post.publishedAt);
  const candidate = editorialDate(post.lastReviewedAt);
  // Ignore invalid chronology at rendering time too, without mutating stored content.
  const reviewed =
    candidate && (!published || candidate >= published) && new Date(candidate).getTime() <= Date.now()
      ? candidate
      : undefined;
  const authors = (post.authors || [])
    .filter((author): author is SanityAuthor & { name: string } => Boolean(author?.name?.trim()))
    .map((author) => ({
      ...author,
      name: author.name.trim(),
      profileUrl: webUrl(author.profileUrl),
      socialUrls: (author.socialUrls || []).map(webUrl).filter((url): url is string => Boolean(url)),
      imageUrl: webUrl(author.imageUrl),
      credentials: (author.credentials || []).filter(
        (credential) => typeof credential === 'string' && credential.trim()
      ),
    }));
  return {
    title: post.seoTitle?.trim() || post.title,
    alt:
      typeof post.mainImage === 'object' && post.mainImage && 'alt' in post.mainImage ? post.mainImage.alt || '' : '',
    published,
    reviewed,
    modified: reviewed || published,
    authors,
  };
}

export function buildArticleSchema(post: SanityPost, canonicalUrl: string, imageUrl?: string | null) {
  const view = postPresentation(post);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    url: canonicalUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    headline: post.title,
    description: post.seoDescription,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    datePublished: view.published,
    dateModified: view.modified,
    author: view.authors.length
      ? view.authors.map((author) => ({
          '@type': 'Person',
          name: author.name,
          ...(author.bio ? { description: author.bio } : {}),
          ...(author.role ? { jobTitle: author.role } : {}),
          ...(author.profileUrl ? { url: author.profileUrl } : {}),
          ...(author.socialUrls.length ? { sameAs: author.socialUrls } : {}),
          ...(author.imageUrl ? { image: author.imageUrl } : {}),
          ...(author.credentials.length
            ? {
                hasCredential: author.credentials.map((name) => ({
                  '@type': 'EducationalOccupationalCredential',
                  name,
                })),
              }
            : {}),
        }))
      : { '@type': 'Organization', name: 'ZiaFlow', url: 'https://ziaflow.com/' },
    publisher: {
      '@type': 'Organization',
      name: 'ZiaFlow',
      url: 'https://ziaflow.com',
      logo: { '@type': 'ImageObject', url: 'https://ziaflow.com/logo.png' },
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
