import type { APIRoute } from 'astro';
import { supabase } from '~/lib/supabase';
import { createSanityPost } from '~/lib/sanityWrite';

export const prerender = false;

export interface DistributePayload {
  title: string;
  slug?: string;
  bodyMarkdown: string;
  category?: string;
  targetAudience?: string;
  tags?: string[];
  seoDescription?: string;
  syncToSanity?: boolean;
  platforms: {
    platform: 'blog' | 'linkedin' | 'twitter' | 'facebook' | 'instagram';
    contentVariant: string;
    mediaUrls?: string[];
    scheduledAt?: string;
  }[];
}

/**
 * GET /api/content/distribute
 * Lists posts and multi-channel distributions with performance metrics
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);

  if (!supabase) {
    return new Response(JSON.stringify({ ok: false, error: 'Database unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let query = supabase
      .from('content_posts')
      .select('*, channel_distributions(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, posts: data ?? [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * POST /api/content/distribute
 * Creates a master content post and generates all platform distribution variants
 */
export const POST: APIRoute = async ({ request }) => {
  if (!supabase) {
    return new Response(JSON.stringify({ ok: false, error: 'Database unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = (await request.json()) as DistributePayload;
    if (!payload.title || !payload.bodyMarkdown) {
      return new Response(JSON.stringify({ ok: false, error: 'title and bodyMarkdown are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Create master content post
    const { data: postData, error: postError } = await supabase
      .from('content_posts')
      .insert([
        {
          title: payload.title,
          slug:
            payload.slug ||
            payload.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
          body_markdown: payload.bodyMarkdown,
          category: payload.category || 'General',
          target_audience: payload.targetAudience || 'General Audience',
          tags: payload.tags || [],
          status: 'draft',
        },
      ])
      .select('id')
      .single();

    if (postError || !postData) {
      return new Response(JSON.stringify({ ok: false, error: postError?.message || 'Failed to create post' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const postId = postData.id;
    let sanityDocId: string | null = null;

    // Optional or default Sanity Sync
    if (payload.syncToSanity !== false) {
      try {
        const sanityDoc = await createSanityPost({
          title: payload.title,
          slug: payload.slug,
          bodyMarkdown: payload.bodyMarkdown,
          category: payload.category,
          seoDescription: payload.seoDescription,
        });
        sanityDocId = sanityDoc._id;
      } catch (sanityErr) {
        console.warn('Non-blocking Sanity sync error:', sanityErr);
      }
    }

    // 2. Insert channel distributions
    if (payload.platforms && payload.platforms.length > 0) {
      const distributions = payload.platforms.map((p) => ({
        post_id: postId,
        platform: p.platform,
        content_variant: p.contentVariant,
        media_urls: p.mediaUrls || [],
        scheduled_at: p.scheduledAt || null,
        status: p.scheduledAt ? 'queued' : 'draft',
      }));

      const { error: distError } = await supabase.from('channel_distributions').insert(distributions);
      if (distError) {
        return new Response(JSON.stringify({ ok: false, error: distError.message, postId }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        postId,
        sanityDocId,
        message: 'Master post, Sanity document, and platform distributions successfully created.',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
