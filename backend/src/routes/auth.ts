import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();
const ADMIN_PIN = process.env.ADMIN_PIN || "EPSIGATE2024";

// Simple token derived from the PIN — not a secret in itself but avoids
// sending the raw PIN as the bearer credential on every request.
export const ADMIN_TOKEN = `epsigate-${Buffer.from(ADMIN_PIN).toString("base64")}`;

router.post("/login", (req: Request, res: Response): any => {
  try {
    const { code } = req.body;

    if (!code || String(code).trim() !== ADMIN_PIN) {
      return res.status(401).json({
        error: "Code d'accès administrateur incorrect.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authentification réussie.",
      token: ADMIN_TOKEN,
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
    if (trimmedCurrent !== (process.env.ADMIN_PIN || "EPSIGATE2024")) {
      return res.status(401).json({ error: "Code actuel incorrect." });
    }

    // Validate new PIN (min 6 chars)
    if (trimmedNew.length < 6) {
      return res.status(400).json({ error: "Le nouveau code doit contenir au moins 6 caractères." });
    }

    // Update .env file
    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
      // Replace existing ADMIN_PIN line
      if (/^ADMIN_PIN=.*/m.test(envContent)) {
        envContent = envContent.replace(/^ADMIN_PIN=.*/m, `ADMIN_PIN=${trimmedNew}`);
      } else {
        envContent += `\nADMIN_PIN=${trimmedNew}`;
      }
    } else {
      envContent = `ADMIN_PIN=${trimmedNew}\n`;
    }

    fs.writeFileSync(envPath, envContent, "utf-8");

    // Update the running process env so it takes effect immediately
    process.env.ADMIN_PIN = trimmedNew;

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
