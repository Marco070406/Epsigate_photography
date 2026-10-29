/**
 * migrate.ts — Crée les tables manquantes et, sur une base vide, insère les données de départ.
 * Appelé automatiquement au premier appel API de chaque instance (voir server.ts).
 */
import { pool } from "./database";
import { SCHEMA_SQL, SEED_SQL } from "./schema";

// Arbitrary key so concurrent serverless instances never seed twice
const MIGRATION_LOCK_KEY = 4207;

let ready: Promise<void> | null = null;

async function migrate(): Promise<void> {
  const client = await pool.connect();
  try {
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
