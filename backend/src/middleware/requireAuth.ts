import { Request, Response, NextFunction } from "express";
import { getAdminToken, safeEqual } from "../routes/auth";

/**
 * Middleware that protects write endpoints (POST / PUT / DELETE).
 * The frontend sends the token in the Authorization header:
 *   Authorization: Bearer <token>
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): any {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token || !safeEqual(token, getAdminToken())) {
    return res.status(401).json({ error: "Accès non autorisé." });
  }

  next();
}
