/**
 * auth.ts — Admin PIN, session token and brute-force protection.
 */
import crypto from "crypto";
import { query, queryOne } from "./database";
import { jsonError } from "./http";

/**
 * Current PIN: the one saved from the admin (admin_config table) wins,
 * otherwise ADMIN_PIN from the environment. Stored in the database so that a
 * PIN change survives restarts and applies to every serverless instance.
 */
export async function getAdminPin(): Promise<string> {
  try {
    const row = await queryOne<{ pin: string }>("SELECT pin FROM admin_config WHERE id = 1");
    if (row?.pin) return row.pin;
  } catch (err) {
    console.error("Could not read admin_config, falling back to ADMIN_PIN:", (err as Error).message);
  }
  if (process.env.ADMIN_PIN) return process.env.ADMIN_PIN;
  // Never fall back to the well-known default PIN on a deployed server
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PIN n'est pas configuré");
  }
  return "EPSIGATE2024";
}

export async function setAdminPin(pin: string): Promise<void> {
  await query(
    `INSERT INTO admin_config (id, pin) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET pin = EXCLUDED.pin, updated_at = NOW()`,
    [pin]
  );
}

/**
 * Session token derived from the PIN with HMAC-SHA256: it cannot be reversed
 * into the PIN and it changes (invalidating every session) when the PIN changes.
 * Set ADMIN_TOKEN_SECRET to make it unpredictable even if the PIN leaks.
 */
export async function getAdminToken(): Promise<string> {
  const pin = await getAdminPin();
  const secret = process.env.ADMIN_TOKEN_SECRET || pin;
  return crypto.createHmac("sha256", secret).update(`epsigate-admin:${pin}`).digest("hex");
}

/** Constant-time string comparison (avoids timing attacks). */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Protects write endpoints. The admin sends `Authorization: Bearer <token>`.
 * Returns a 401 response to send back, or null when the caller is authorized.
 */
export async function requireAdmin(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token || !safeEqual(token, await getAdminToken())) {
    return jsonError("Accès non autorisé.", 401);
  }
  return null;
}

// ─── Brute-force protection ───────────────────────────────────────────────────
// In-memory, so per instance on Vercel: it slows attacks down without being a hard limit.

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export function isLocked(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailure(ip: string): void {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() > entry.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: Date.now() + LOCK_WINDOW_MS });
  } else {
    entry.count++;
  }
}

export function clearFailures(ip: string): void {
  failedAttempts.delete(ip);
}
