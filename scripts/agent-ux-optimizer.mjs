import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

const env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !key.startsWith('#')) {
        env[key] = val;
      }
    }
  }
}

const SUPABASE_URL = env.PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || env.PUBLIC_SUPABASE_ANON_KEY;

async function queryIntelligence() {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/view_unified_page_intelligence?order=date.desc&limit=25`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to query intelligence view: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

export async function runAutonomousDiagnostics() {
  console.log('🤖 [Agent Optimizer] Scanning unified page telemetry...');
  const rows = await queryIntelligence();

  const issues = [];

  for (const row of rows) {
    const page = row.page_path;

    // Check 1: User Friction (Dead / Rage clicks from Clarity)
    const deadClicks = row.clarity_dead_clicks || 0;
    const rageClicks = row.clarity_rage_clicks || 0;
    if (deadClicks > 0 || rageClicks > 0) {
      issues.push({
        type: 'UX_FRICTION',
        severity: rageClicks > 0 ? 'HIGH' : 'MEDIUM',
        page,
        details: `${deadClicks} dead click(s), ${rageClicks} rage click(s) detected via Microsoft Clarity.`,
        recommendation: 'Inspect CTA button dimensions, hover feedback, and link href targets in corresponding Astro component.'
      });
    }

    // Check 2: Low SERP CTR (Search Console opportunity)
    const impressions = row.google_impressions || 0;
    const clicks = row.google_clicks || 0;
    const position = parseFloat(row.avg_google_position || '0');
    if (impressions >= 150 && (clicks / impressions) < 0.08 && position <= 10) {
      issues.push({
        type: 'SEO_CTR_OPPORTUNITY',
        severity: 'MEDIUM',
        page,
        details: `Ranking at position ${position.toFixed(1)} with ${impressions} impressions but low CTR (${((clicks / impressions) * 100).toFixed(2)}%).`,
        recommendation: 'Optimize meta title and meta description in frontmatter to improve click-through intent.'
      });
    }

    // Check 3: High Bounce / Low Engagement (GA4)
    const bounceRate = parseFloat(row.bounce_rate || '0');
    const avgTime = parseFloat(row.avg_engagement_time_sec || '0');
    if (bounceRate > 0.30 && avgTime < 60) {
      issues.push({
        type: 'ENGAGEMENT_DROP',
        severity: 'HIGH',
        page,
        details: `High bounce rate (${(bounceRate * 100).toFixed(1)}%) and low dwell time (${avgTime.toFixed(0)}s).`,
        recommendation: 'Enhance above-the-fold hero copy, add social proof badges, or introduce an interactive lead widget.'
      });
    }
  }

  return issues;
}

async function main() {
  const issues = await runAutonomousDiagnostics();
  console.log(`\nFound ${issues.length} actionable optimization signals:`);
  console.table(issues);
}

if (process.argv[1] && process.argv[1].endsWith('agent-ux-optimizer.mjs')) {
  main().catch(err => {
    console.error('Diagnostic error:', err);
    process.exit(1);
  });
}
