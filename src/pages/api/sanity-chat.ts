import type { APIRoute } from 'astro';
import { sanityChat } from '../../lib/sanity-chat';

export const prerender = false;

export const POST: APIRoute = ({ request }) =>
  sanityChat(request, {
    SANITY_ORGANIZATION_TOKEN: process.env.SANITY_ORGANIZATION_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SANITY_CHAT_ACCESS_TOKEN: process.env.SANITY_CHAT_ACCESS_TOKEN,
  });
