// Fresh-database harness for supabase/migrations.
//
// Boots an in-process Postgres (PGlite — real Postgres compiled to WASM) and
// builds the schema the way production will see it:
//
//   00_supabase_shim.sql        API roles, auth.uid(), storage — what Supabase provides
//   000_legacy_baseline.sql     production `public` schema at migration 046 (structure only)
//   migrations/NNN_*.sql        every migration numbered after 046, in order
//
// Migrations 001–046 are not replayed: production was partly built outside this
// folder, so that history does not reproduce on an empty database (see the
// header of 000_legacy_baseline.sql). Nothing here touches a real project.

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const MIGRATIONS_DIR = join(here, '..', 'migrations')
/** The last migration already folded into 000_legacy_baseline.sql. */
export const BASELINE_VERSION = 46

async function loadPGlite() {
  if (process.env.PGLITE_PATH) return (await import(pathToFileURL(process.env.PGLITE_PATH).href)).PGlite
  try { return (await import('@electric-sql/pglite')).PGlite } catch {
    throw new Error('PGlite not found — run `npm install` (devDependency @electric-sql/pglite) or set PGLITE_PATH to its dist/index.js')
  }
}

/** Migration files applied on top of the baseline, in order. */
export function pendingMigrations() {
  return readdirSync(MIGRATIONS_DIR)
    .filter(f => /^\d{3}_.+\.sql$/.test(f) && Number(f.slice(0, 3)) > BASELINE_VERSION)
    .sort()
}

/**
 * Create a fresh database: shim → production baseline → newer migrations.
 * @param {{ log?: (s: string) => void, beforeMigrations?: (db: any) => Promise<void> }} opts
 */
export async function freshDatabase(opts = {}) {
  const PGlite = await loadPGlite()
  const db = new PGlite()
  await db.exec(`set timezone = 'UTC'`)   // production sessions run in UTC
  await db.exec(readFileSync(join(here, '00_supabase_shim.sql'), 'utf8'))
  await db.exec(readFileSync(join(here, '000_legacy_baseline.sql'), 'utf8'))
  opts.log?.('applied tests/000_legacy_baseline.sql (production schema @ 046)')
  if (opts.beforeMigrations) await opts.beforeMigrations(db)
  const applied = []
  for (const f of pendingMigrations()) {
    try {
      await db.exec(readFileSync(join(MIGRATIONS_DIR, f), 'utf8'))
    } catch (e) {
      const err = new Error(`migration ${f} failed: ${e.message}`)
      err.file = f
      throw err
    }
    applied.push(f)
    opts.log?.(`applied ${f}`)
  }
  return { db, applied }
}

/** Compare the baseline against production checksums (call before migrations). */
export async function checkBaselineFidelity(db) {
  const expected = JSON.parse(readFileSync(join(here, 'baseline-fidelity.json'), 'utf8'))
  const { rows } = await db.query(`
    select p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as sig, md5(p.prosrc) as h
    from pg_proc p where p.pronamespace = 'public'::regnamespace`)
  const got = Object.fromEntries(rows.map(r => [r.sig, r.h]))
  const problems = []
  for (const [sig, h] of Object.entries(expected.functions)) {
    if (!(sig in got)) problems.push(`missing function ${sig}`)
    else if (got[sig] !== h) problems.push(`function body differs from production: ${sig}`)
  }
  for (const sig of Object.keys(got)) if (!(sig in expected.functions)) problems.push(`unexpected function ${sig}`)
  const counts = (await db.query(`select
      (select count(*)::int from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r') as tables,
      (select count(*)::int from pg_class where relnamespace = 'public'::regnamespace and relkind = 'v') as views,
      (select count(*)::int from pg_policies where schemaname = 'public') as policies,
      (select count(*)::int from pg_trigger t join pg_class c on c.oid = t.tgrelid
         where c.relnamespace = 'public'::regnamespace and not t.tgisinternal) as triggers_public`)).rows[0]
  for (const k of ['tables', 'views', 'policies', 'triggers_public']) {
    if (counts[k] !== expected.counts[k]) problems.push(`${k}: baseline has ${counts[k]}, production has ${expected.counts[k]}`)
  }
  return problems
}

/** Run `fn` as an API caller: 'anon', or a user id (role authenticated). */
export async function as(db, who, fn) {
  const role = who === 'anon' ? 'anon' : 'authenticated'
  const sub = who === 'anon' ? '' : who
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [sub])
  await db.exec(`set role ${role}`)
  try { return await fn() } finally {
    await db.exec(`reset role`)
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`)
  }
}
