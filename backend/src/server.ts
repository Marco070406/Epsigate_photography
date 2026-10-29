// Must be the first import: route modules read process.env at load time
import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth";
import contactRoutes from "./routes/contact";
import messagesRoutes from "./routes/messages";
import portfolioRoutes from "./routes/portfolio";
import servicesRoutes from "./routes/services";
import teamRoutes from "./routes/team";
import settingsRoutes from "./routes/settings";
import statsRoutes from "./routes/stats";
import uploadRoutes from "./routes/upload";
import { ensureSchema } from "./data/migrate";

const app = express();
const PORT = process.env.PORT || 5000;
// Comma-separated list, e.g. "https://epsigate.vercel.app,http://localhost:3000"
const CORS_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Ensure uploads folder exists (local only: Vercel's filesystem is read-only)
const uploadsPath = path.resolve(process.cwd(), "uploads");
if (!process.env.VERCEL && !fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.disable("x-powered-by");
// Behind a hosting proxy (Render, Railway…): correct req.ip and req.protocol
app.set("trust proxy", 1);

app.use(cors({ origin: CORS_ORIGINS, credentials: false }));
// Images go through multer (/api/upload), JSON bodies stay small
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Serve uploaded static files
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  },
  express.static(uploadsPath, { maxAge: "1d" })
);

// Health Check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "Epsigate Photography Backend API", timestamp: new Date().toISOString() });
});

// Create missing tables (and seed an empty database) before the first API call
app.use("/api", (_req, _res, next) => {
  ensureSchema().then(() => next(), next);
});

// Routes — auth is handled per-method inside each router
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/upload", uploadRoutes);

// Fallback 404
app.use((_req, res) => {
  res.status(404).json({ error: "Route API introuvable" });
});

// Error handler: upload errors, malformed JSON, etc. — always answer in JSON
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image trop volumineuse." : "Erreur lors du téléversement.";
    return res.status(400).json({ error: message });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Requête JSON invalide." });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Requête trop volumineuse." });
  }
  if (err?.status === 400 && err?.message) {
    return res.status(400).json({ error: err.message });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Erreur interne du serveur." });
});

// On Vercel the exported app runs as a function; locally we start an HTTP server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✨ Serveur Backend Epsigate démarré sur http://localhost:${PORT}`);
    console.log(`📁 Fichiers téléversés servis sur http://localhost:${PORT}/uploads`);
  });
}

export default app;
