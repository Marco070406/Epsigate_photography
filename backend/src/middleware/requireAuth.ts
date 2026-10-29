import { Request, Response, NextFunction } from "express";
import { getAdminToken, safeEqual } from "../routes/auth";

/**
 * Middleware that protects write endpoints (POST / PUT / DELETE).
 * The frontend sends the token in the Authorization header:
 *   Authorization: Bearer <token>
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token || !safeEqual(token, await getAdminToken())) {
      return res.status(401).json({ error: "Accès non autorisé." });
    }

    next();
  } catch {
    return res.status(500).json({ error: "Erreur lors de la vérification de l'accès." });
  }
}
