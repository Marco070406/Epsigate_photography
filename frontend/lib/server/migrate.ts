/**
 * migrate.ts — Crée les tables manquantes et, sur une base vide, insère les données de départ.
 * Appelé automatiquement avant la première requête SQL de chaque instance (voir database.ts).
 */
import { pool } from "./database";
import { SCHEMA_SQL, SEED_SQL } from "./schema";

// Arbitrary key so concurrent serverless instances never seed twice
const MIGRATION_LOCK_KEY = 4207;

let ready: Promise<void> | null = null;

async function migrate(): Promise<void> {
  const client = await pool.connect();
  try {
    // Fast path: rate_limits is the last table of SCHEMA_SQL and messages.event_time
    // its newest column, created in the same transaction as the seed, so their
    // presence means the database is fully set up (one query per cold start).
    // When adding a table or column, move this check to it so existing databases
    // get it too.
    const check = await client.query(
      `SELECT to_regclass('public.rate_limits') IS NOT NULL AND EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'event_time'
       ) AS ready`
    );
    if (check.rows[0].ready) return;

    // Transaction-level lock: works through Neon's connection pooler
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [MIGRATION_LOCK_KEY]);
    await client.query(SCHEMA_SQL);
    const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM settings");
    if (rows[0].count === 0) {
      await client.query(SEED_SQL);
      console.log("✅ Base initialisée avec les données de départ");
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Runs the migration once per instance; retried on the next call if it failed. */
export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = migrate().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}
