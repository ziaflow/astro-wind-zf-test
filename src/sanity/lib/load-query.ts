import type { QueryParams } from '@sanity/client';
import { sanityClient } from 'sanity:client';

const visualEditingEnabled = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === 'true';
const token = import.meta.env.SANITY_API_TOKEN || import.meta.env.SANITY_API_READ_TOKEN;

export async function loadQuery<QueryResponse>({ query, params }: { query: string; params?: QueryParams }) {
  const perspective = visualEditingEnabled ? 'drafts' : 'published';
  const { result, resultSourceMap } = await sanityClient.fetch<QueryResponse>(query, params ?? {}, {
    filterResponse: false,
    perspective,
    resultSourceMap: visualEditingEnabled ? 'withKeyArraySelector' : false,
    stega: visualEditingEnabled,
    ...(visualEditingEnabled && token ? { token } : {}),
  });

  return {
    data: result,
    sourceMap: resultSourceMap,
    perspective,
  };
}
