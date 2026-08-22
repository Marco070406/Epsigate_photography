import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Ensure uploads folder exists
const uploadsPath = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(cors({ origin: CORS_ORIGIN, credentials: false }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded static files
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsPath, { maxAge: "1d" })
);

// Health Check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "Epsigate Photography Backend API", timestamp: new Date().toISOString() });
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

app.listen(PORT, () => {
  console.log(`✨ Serveur Backend Epsigate démarré sur http://localhost:${PORT}`);
  console.log(`📁 Fichiers téléversés servis sur http://localhost:${PORT}/uploads`);
});
