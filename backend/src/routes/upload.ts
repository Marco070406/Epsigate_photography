import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// On Vercel the filesystem is read-only: images go to Vercel Blob when its token is set,
// otherwise (local development) they are written to ./uploads.
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Extension derived from the MIME type: a file named "x.html" can never be served as HTML
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

function buildFilename(file: Express.Multer.File): string {
  const ext = EXTENSIONS[file.mimetype.toLowerCase()] || ".jpg";
  const sanitizedBase =
    path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase().slice(0, 60) || "image";
  return `${sanitizedBase}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
}

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (EXTENSIONS[file.mimetype.toLowerCase()]) {
    cb(null, true);
  } else {
    const err = new Error("Format non supporté. Choisissez une image JPG, PNG, WebP ou AVIF.") as Error & { status: number };
    err.status = 400;
    cb(err);
  }
};

// Vercel Functions accept request bodies up to 4.5 MB
const MAX_SIZE = (USE_BLOB ? 4 : 25) * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_SIZE }, fileFilter });

router.post("/", requireAuth, upload.single("image"), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier image téléversé." });
    const filename = buildFilename(req.file);

    let fileUrl: string;
    if (USE_BLOB) {
      const blob = await put(`uploads/${filename}`, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
      });
      fileUrl = blob.url;
    } else {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), req.file.buffer);
      const host = req.get("host") || "localhost:5000";
      fileUrl = `${req.protocol}://${host}/uploads/${filename}`;
    }

    return res.status(201).json({
      success: true,
      message: "Image téléversée avec succès.",
      data: { url: fileUrl, relativePath: `/uploads/${filename}`, filename, size: req.file.size, mimetype: req.file.mimetype },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Erreur lors du téléversement de l'image." });
  }
});

export default router;
