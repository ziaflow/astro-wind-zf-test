import type { APIRoute } from 'astro';
import { processSubmission, requestMeta } from '~/lib/forms/submit';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const formData = await request.formData();
    const result = await processSubmission(formData, requestMeta(request, clientAddress));

    if (result.ok) {
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ ok: false, status: 500, code: 'persist_failed', message: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
