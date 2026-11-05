-- Restrict reporting to trusted server-side service-role consumers.
-- The internal optimizer uses the service role. Browser users do not need this view.
BEGIN;
ALTER VIEW public.view_unified_page_intelligence SET (security_invoker = true);
REVOKE ALL ON public.view_unified_page_intelligence FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.view_unified_page_intelligence TO service_role;

COMMIT;
