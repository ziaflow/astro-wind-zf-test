import { supabaseAdmin } from '~/lib/supabase-admin';

const BUCKET = 'web-img';

/**
 * Standard asset names stored in the Supabase 'web-img' bucket.
 */
export const SUPABASE_ASSETS = {
  logoSolo: 'img/ZiaFlow_Logo_solo.png',
  logoFull: 'img/ziaflow_com_updated.png',
  logoGreyCrop: 'img/ziaflow_grey_crop.png',
  logoGrey: 'img/ziaflow_grey_logo.png',
  partnerGoogle: 'img/Google_Partner.png',
  partnerMicrosoft: 'img/microsoft_partner.png',
  partnerTiktok: 'img/tiktok_partner.jpg',
  figmaHero: 'figma_image_1760736804_I0JBCk.png',
} as const;

/**
 * Generates a signed URL for an image in the Supabase storage bucket.
 * Defaults to 1-year expiration (31536000 seconds).
 */
export async function getSupabaseAssetUrl(
  path: string,
  expiresInSeconds: number = 31536000
): Promise<string | null> {
  if (!supabaseAdmin) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn(`[supabase-assets] Failed to sign URL for ${path}:`, error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn(`[supabase-assets] Exception retrieving ${path}:`, err);
    return null;
  }
}

/**
 * Fetches published client or landing page evidence from Supabase.
 */
export async function getPageIntelligence(pagePath: string) {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('view_unified_page_intelligence')
      .select('*')
      .eq('page_path', pagePath)
      .maybeSingle();

    if (error) {
      console.warn(`[supabase-assets] Intelligence query failed for ${pagePath}:`, error.message);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
