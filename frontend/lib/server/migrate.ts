/**
 * migrate.ts — Crée les tables manquantes et, sur une base vide, insère les données de départ.
 * Appelé automatiquement avant la première requête SQL de chaque instance (voir database.ts).
 */
import { pool } from "./database";
import { SCHEMA_SQL, SEED_SQL } from "./schema";
import { CONTENT_SQL, CONTENT_VERSION } from "./content";

// Arbitrary key so concurrent serverless instances never seed twice
const MIGRATION_LOCK_KEY = 4207;

let ready: Promise<void> | null = null;

async function migrate(): Promise<void> {
  const client = await pool.connect();
  try {
    // Fast path (one query per cold start): the last migration stores its version
    // as the comment of the rate_limits table, in the same transaction as the
    // schema, seed and content updates. Bump CONTENT_VERSION after changing
    // SCHEMA_SQL or CONTENT_SQL so existing databases get the change.
    const check = await client.query(
      "SELECT obj_description(to_regclass('public.rate_limits'), 'pg_class') = $1 AS ready",
      [CONTENT_VERSION]
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
    await client.query(CONTENT_SQL);
    // COMMENT does not accept parameters; the version is a constant from content.ts
    await client.query(`COMMENT ON TABLE rate_limits IS '${CONTENT_VERSION}'`);
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
