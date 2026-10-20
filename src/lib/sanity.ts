import { createClient, type SanityClient } from '@sanity/client';

export const sanityProjectId = import.meta.env.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '92p0tpps';
export const sanityDataset = import.meta.env.SANITY_DATASET || process.env.SANITY_DATASET || 'production';
export const sanityApiVersion = import.meta.env.SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2026-03-01';
export const sanityToken =
  import.meta.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_SECRET_TOKEN;

/**
 * Sanity Client for GROQ Queries & Edge/Build Ingestion
 */
export const sanityClient: SanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: false, // Set to false for ISR / on-demand queries
  token: sanityToken,
});

export default sanityClient;
