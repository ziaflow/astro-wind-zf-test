// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly WEB3FORMS_ACCESS_KEY: string;
  readonly SANITY_DOCS_WEBHOOK_SECRET: string;
  readonly SUPERHUMAN_DOCS_API_TOKEN: string;
  readonly SUPERHUMAN_DOCS_DOC_ID: string;
  readonly SUPERHUMAN_DOCS_PARENT_PAGE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
