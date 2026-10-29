/**
 * rateLimit.ts — Fixed-window counters stored in PostgreSQL, so the limits hold
 * across every serverless instance (an in-memory Map would be per instance).
 */
import { query, queryOne } from "./database";

/** Counts one attempt for `key` and returns the number of attempts in the current window. */
export async function hit(key: string, windowSeconds: number): Promise<number> {
  const rows = await query<{ count: number }>(
    `INSERT INTO rate_limits (key, count, reset_at)
     VALUES ($1, 1, NOW() + make_interval(secs => $2))
     ON CONFLICT (key) DO UPDATE SET
       count    = CASE WHEN rate_limits.reset_at < NOW() THEN 1 ELSE rate_limits.count + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at < NOW() THEN NOW() + make_interval(secs => $2)
                       ELSE rate_limits.reset_at END
     RETURNING count`,
    [key, windowSeconds]
  );
  return rows[0].count;
}

/** Number of attempts for `key` in the current window (0 when expired). */
export async function attempts(key: string): Promise<number> {
  const row = await queryOne<{ count: number }>(
    "SELECT count FROM rate_limits WHERE key = $1 AND reset_at > NOW()",
    [key]
  );
  return row?.count ?? 0;
}

export async function reset(key: string): Promise<void> {
  await query("DELETE FROM rate_limits WHERE key = $1", [key]);
}
