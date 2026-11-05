-- Isolated Postgres fixture. Never run against production.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
CREATE TABLE public.reporting_fixture (page_path text);
INSERT INTO public.reporting_fixture VALUES ('/fixture');
ALTER TABLE public.reporting_fixture ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.reporting_fixture TO service_role;
CREATE VIEW public.view_unified_page_intelligence AS SELECT * FROM public.reporting_fixture;
GRANT ALL ON public.view_unified_page_intelligence TO PUBLIC, anon, authenticated;
