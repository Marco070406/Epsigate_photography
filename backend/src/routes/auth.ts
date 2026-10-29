import { Router, Request, Response } from "express";
import crypto from "crypto";
import { query, queryOne } from "../data/database";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

/**
 * Current PIN: the one saved from the admin (admin_config table) wins,
 * otherwise ADMIN_PIN from the environment. Stored in the database so that a
 * PIN change survives restarts and applies to every serverless instance.
 */
async function getAdminPin(): Promise<string> {
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

/**
 * Session token derived from the PIN with HMAC-SHA256: it cannot be reversed
 * into the PIN and it changes (invalidating every session) when the PIN changes.
 * Set ADMIN_TOKEN_SECRET in .env to make it unpredictable even if the PIN leaks.
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

// ─── Brute-force protection ───────────────────────────────────────────────────
// In-memory, so per instance on Vercel: it slows attacks down without being a hard limit.

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function isLocked(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): void {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() > entry.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: Date.now() + LOCK_WINDOW_MS });
  } else {
    entry.count++;
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const ip = req.ip || "unknown";
    if (isLocked(ip)) {
      return res.status(429).json({
        error: "Trop de tentatives échouées. Réessayez dans 15 minutes.",
      });
    }

    const { code } = req.body;

    if (!code || !safeEqual(String(code).trim(), await getAdminPin())) {
      recordFailure(ip);
      return res.status(401).json({
        error: "Code d'accès administrateur incorrect.",
      });
    }

    failedAttempts.delete(ip);
    return res.status(200).json({
      success: true,
      message: "Authentification réussie.",
      token: await getAdminToken(),
    });
  } catch {
    return res.status(500).json({ error: "Erreur lors de l'authentification." });
  }
});

/**
 * POST /api/auth/change-pin
 * Body: { currentPin: string, newPin: string }
 * Requires a valid Bearer token (the admin must be logged in).
 */
router.post("/change-pin", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin) {
      return res.status(400).json({ error: "Code actuel et nouveau code requis." });
    }

    const trimmedCurrent = String(currentPin).trim();
    const trimmedNew = String(newPin).trim();

    // Verify current PIN
    if (!safeEqual(trimmedCurrent, await getAdminPin())) {
      return res.status(401).json({ error: "Code actuel incorrect." });
    }

    // Validate new PIN (6–64 chars, no whitespace)
    if (!/^\S{6,64}$/.test(trimmedNew)) {
      return res.status(400).json({
        error: "Le nouveau code doit contenir entre 6 et 64 caractères, sans espace.",
      });
    }

    await query(
      `INSERT INTO admin_config (id, pin) VALUES (1, $1)
       ON CONFLICT (id) DO UPDATE SET pin = EXCLUDED.pin, updated_at = NOW()`,
      [trimmedNew]
    );

    return res.status(200).json({
      success: true,
      message: "Code PIN mis à jour. Reconnectez-vous avec votre nouveau code.",
    });
  } catch (err) {
    console.error("Error changing PIN:", err);
    return res.status(500).json({ error: "Erreur lors du changement de code." });
  }
});

export default router;
