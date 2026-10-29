-- REVIEW ONLY: not applied. Run through the approved database change process.
-- The internal optimizer uses the service role. Browser users do not need this view.
BEGIN;
ALTER VIEW public.view_unified_page_intelligence SET (security_invoker = true);
REVOKE ALL ON public.view_unified_page_intelligence FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.view_unified_page_intelligence TO service_role;
-- Before COMMIT verify anon/authenticated cannot SELECT and service_role can.
COMMIT;
