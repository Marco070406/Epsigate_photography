import { Router, Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

/** Current PIN — read on each call so a PIN change takes effect immediately. */
function getAdminPin(): string {
  return process.env.ADMIN_PIN || "EPSIGATE2024";
}

/**
 * Session token derived from the PIN with HMAC-SHA256: it cannot be reversed
 * into the PIN and it changes (invalidating every session) when the PIN changes.
 * Set ADMIN_TOKEN_SECRET in .env to make it unpredictable even if the PIN leaks.
 */
export function getAdminToken(): string {
  const pin = getAdminPin();
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

router.post("/login", (req: Request, res: Response): any => {
  try {
    const ip = req.ip || "unknown";
    if (isLocked(ip)) {
      return res.status(429).json({
        error: "Trop de tentatives échouées. Réessayez dans 15 minutes.",
      });
    }

    const { code } = req.body;

    if (!code || !safeEqual(String(code).trim(), getAdminPin())) {
      recordFailure(ip);
      return res.status(401).json({
        error: "Code d'accès administrateur incorrect.",
      });
    }

    failedAttempts.delete(ip);
    return res.status(200).json({
      success: true,
      message: "Authentification réussie.",
      token: getAdminToken(),
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
router.post("/change-pin", requireAuth, (req: Request, res: Response): any => {
  try {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin) {
      return res.status(400).json({ error: "Code actuel et nouveau code requis." });
    }

    const trimmedCurrent = String(currentPin).trim();
    const trimmedNew = String(newPin).trim();

    // Verify current PIN
    if (!safeEqual(trimmedCurrent, getAdminPin())) {
      return res.status(401).json({ error: "Code actuel incorrect." });
    }

    // Validate new PIN (6–64 chars, no whitespace so it cannot break the .env file)
    if (!/^\S{6,64}$/.test(trimmedNew)) {
      return res.status(400).json({
        error: "Le nouveau code doit contenir entre 6 et 64 caractères, sans espace.",
      });
    }

    // Update the running process env so it takes effect immediately
    process.env.ADMIN_PIN = trimmedNew;

    // Persist in the .env file (may fail on read-only hosting)
    let persisted = true;
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      let envContent = "";

      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
        // Replace existing ADMIN_PIN line
        if (/^ADMIN_PIN=.*/m.test(envContent)) {
          envContent = envContent.replace(/^ADMIN_PIN=.*/m, () => `ADMIN_PIN=${trimmedNew}`);
        } else {
          envContent += `\nADMIN_PIN=${trimmedNew}\n`;
        }
      } else {
        envContent = `ADMIN_PIN=${trimmedNew}\n`;
      }

      fs.writeFileSync(envPath, envContent, "utf-8");
    } catch (err) {
      persisted = false;
      console.error("Could not persist ADMIN_PIN to .env:", err);
    }

    return res.status(200).json({
      success: true,
      message: persisted
        ? "Code PIN mis à jour. Reconnectez-vous avec votre nouveau code."
        : "Code PIN mis à jour jusqu'au prochain redémarrage du serveur : pensez à modifier ADMIN_PIN chez votre hébergeur.",
    });
  } catch (err) {
    console.error("Error changing PIN:", err);
    return res.status(500).json({ error: "Erreur lors du changement de code." });
  }
});

export default router;
