import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Supply an isolated PGlite installation; no production database credentials are used.
const modulePath = process.env.REPORTING_TEST_PGLITE;
test('migration denies public roles and preserves service-role reporting', { skip: !modulePath }, async () => {
  const { PGlite } = await import(modulePath);
  const db = new PGlite();
  try {
    await db.exec(readFileSync(new URL('./reporting-view-access.sql', import.meta.url), 'utf8'));
    const migration = readFileSync(
      new URL('../supabase/migrations/20261105091845_restrict_reporting_view_access.sql', import.meta.url),
      'utf8'
    );
    await db.exec(migration);
    await db.exec(migration); // repeatable without broadening access
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      await assert.rejects(db.query('SELECT * FROM public.view_unified_page_intelligence'), /permission denied/);
      await db.exec('RESET ROLE');
    }
    await db.exec('SET ROLE service_role');
    assert.equal((await db.query('SELECT * FROM public.view_unified_page_intelligence')).rows[0].page_path, '/fixture');
    await db.exec('RESET ROLE');
    const result = await db.query(
      "SELECT reloptions FROM pg_class WHERE oid = 'public.view_unified_page_intelligence'::regclass"
    );
    assert.ok(result.rows[0].reloptions.includes('security_invoker=true'));
  } finally {
    await db.close();
  }
});
