import type { APIRoute } from 'astro';
import { captureContact } from '~/lib/contact-intake';
export const prerender = false;
export const POST: APIRoute = ({ request }) =>
  captureContact(request, {
    SUPABASE_URL: process.env.SUPABASE_URL || import.meta.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    WEBSITE_INTAKE_ENABLED: process.env.WEBSITE_INTAKE_ENABLED || import.meta.env.WEBSITE_INTAKE_ENABLED,
    WEBSITE_INTAKE_TEST_ONLY: process.env.WEBSITE_INTAKE_TEST_ONLY || import.meta.env.WEBSITE_INTAKE_TEST_ONLY,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
