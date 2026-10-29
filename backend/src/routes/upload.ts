import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Extension derived from the MIME type: a file named "x.html" can never be served as HTML
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => { cb(null, UPLOADS_DIR); },
  filename: (_req, file, cb) => {
    const ext = EXTENSIONS[file.mimetype.toLowerCase()] || ".jpg";
    const sanitizedBase =
      path.basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase().slice(0, 60) || "image";
    cb(null, `${sanitizedBase}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (EXTENSIONS[file.mimetype.toLowerCase()]) {
    cb(null, true);
  } else {
    const err = new Error("Format non supporté. Choisissez une image JPG, PNG, WebP ou AVIF.") as Error & { status: number };
    err.status = 400;
    cb(err);
  }
};

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 }, fileFilter });

router.post("/", requireAuth, upload.single("image"), (req: Request, res: Response): any => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier image téléversé." });
    const host = req.get("host") || "localhost:5000";
    const fileUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      message: "Image téléversée avec succès.",
      data: { url: fileUrl, relativePath: `/uploads/${req.file.filename}`, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Erreur lors du téléversement de l'image." });
  }
});

export default router;
