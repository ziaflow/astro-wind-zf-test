import type { APIRoute } from 'astro';
import { supabase } from '~/lib/supabase';

export const prerender = false;

interface SanityWebhookPayload {
  _id: string;
  _type: string;
  title?: string;
  slug?: { current?: string };
  seoDescription?: string;
  editorialStatus?: string;
  targetKeywords?: string[];
  publishedAt?: string;
}

/**
 * Webhook endpoint / Sanity Function destination
 * Triggered on Sanity document publish / update
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return new Response(JSON.stringify({ ok: false, error: 'empty_payload' }), { status: 400 });
    }

    const payload: SanityWebhookPayload = JSON.parse(rawBody);

    // Filter to published blog posts
    if (payload._type !== 'post') {
      return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'not_a_post' }), { status: 200 });
    }

    console.log(`[Sanity Function Event] Processing post: "${payload.title}" (${payload._id})`);

    // Sync to Supabase if client is ready
    if (supabase && payload.slug?.current) {
      const { error } = await supabase.from('blog_seo_tracking').upsert({
        sanity_id: payload._id,
        title: payload.title || 'Untitled',
        slug: payload.slug.current,
        meta_description: payload.seoDescription || '',
        editorial_status: payload.editorialStatus || 'approved',
        target_keywords: payload.targetKeywords || [],
        published_at: payload.publishedAt || new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('[Sanity Function Event] Supabase sync notice:', error.message);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        receivedId: payload._id,
        action: 'processed',
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Sanity Function Event] Error:', message);
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 500 });
  }
};
